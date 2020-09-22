import './hot-reload';

import * as utils from './utils';

function publish(msg: any) {
  chrome.windows.getAll({ populate: true }, function (window_list) {
    for (let i = 0; i < window_list.length; i++) {
      const window = window_list[i];
      if (window.tabs == null) return;
      for (let j = 0; j < window.tabs.length; j++) {
        const tab = window.tabs[j];
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, msg);
        }
      }
    }
  });
}

let idToken = '';

type SignInResponse = {
  data: {
    idToken: string;
  };
};

function startSignInFlow(respond?: (resp: SignInResponse) => void) {
  const manifest = chrome.runtime.getManifest();
  if (manifest.oauth2 == null || manifest.oauth2.scopes == null) {
    throw 'Invalid manifest.json';
  }
  const clientId = encodeURIComponent(manifest.oauth2.client_id);
  const scopes = encodeURIComponent(manifest.oauth2.scopes.join(' '));
  const redirectUri = encodeURIComponent(
    'https://' + chrome.runtime.id + '.chromiumapp.org',
  );
  const url =
    'https://accounts.google.com/o/oauth2/auth' +
    '?client_id=' +
    clientId +
    '&response_type=id_token' +
    '&access_type=offline' +
    '&redirect_uri=' +
    redirectUri +
    '&scope=' +
    scopes;

  chrome.identity.launchWebAuthFlow(
    {
      url: url,
      interactive: true,
    },
    function (redirectedTo) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      } else {
        idToken =
          redirectedTo?.split('#', 2)[1]?.split('&')[0]?.split('=')[1] ?? '';
        respond && respond({ data: { idToken } });
      }
    },
  );
}

function fetchIdToken(resp: any) {
  resp({ type: 'idToken', data: { idToken } });
}

async function injectContentScript() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true }, (tabs) => {
      const tabId = tabs[0].id;
      if (tabId == null) return;
      chrome.tabs.executeScript(
        tabId,
        {
          code: "document.getElementById('dc-root') == null",
        },
        (res) => {
          if (res[0] === true) {
            chrome.tabs.executeScript(
              tabId,
              {
                file: '/js/content.js',
                runAt: 'document_start',
              },
              () => {
                resolve();
              },
            );
          } else {
            resolve();
          }
        },
      );
    });
  });
}

type CaptureMsg = {
  area: { x: number; y: number; w: number; h: number };
  dpr: number;
};

type CaptureMsgResp = { type: 'capture'; data: string };

type ComponentAddMsg = {
  // base64
  dataURL: string;
  domain: string;
};

function handleCaptureMsg(
  msg: CaptureMsg,
  res: (respData: CaptureMsgResp) => void,
) {
  chrome.tabs.query({ active: true }, (tab) => {
    chrome.tabs.captureVisibleTab(
      tab[0].windowId,
      { format: 'png' },
      (image) => {
        crop(image, msg.area, msg.dpr, msg.dpr, 'png', (cropped) => {
          res({ type: 'capture', data: cropped });
        });
      },
    );
  });
}
async function componentAdd(msg: ComponentAddMsg, respond: any) {
  const fd = new FormData();
  fd.append('domain', msg.domain);
  fd.append('name', 'component_name');
  fd.append('file', await utils.dataUrlToFile(msg.dataURL, 'file'));

  // No need to receive token as argument since this closure can reference
  // `idToken` global variable. But I just want to clarify it can be modified after retry.
  const request = (token: string) => {
    return fetch(`${API_URL}/components`, {
      method: 'post',
      headers: { Authorization: 'Bearer ' + token },
      body: fd,
    });
  };

  const resp = await request(idToken);

  // Retry if idToken has expired.
  if (resp.status === 401) {
    startSignInFlow(async (response) => {
      const retryResp = await request(response.data.idToken);
      respond({ data: { value: retryResp.ok } });
    });
  } else {
    respond({ data: { value: resp.ok } });
  }
}

function toggleCapture() {
  if (idToken === '') return;
  chrome.tabs.query({ active: true }, async (tab) => {
    if (tab[0].id == null) return;
    await injectContentScript();
    chrome.tabs.sendMessage(
      tab[0].id,
      { type: 'capture.toggle.request' },
      () => {
        chrome.runtime.sendMessage({ type: 'capture.toggle.complete' });
      },
    );
  });
}

chrome.runtime.onMessage.addListener((msg, _, respond) => {
  console.log(msg);
  switch (msg.type) {
    case 'signIn':
      startSignInFlow(respond);
      break;
    case 'idToken':
      fetchIdToken(respond);
      break;
    case 'capture.toggle.request':
      toggleCapture();
      break;
    case 'capture.execute':
      handleCaptureMsg(msg, respond);
      break;
    case 'api.component.add':
      componentAdd(msg, respond);
      break;
    default:
      break;
  }
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture.toggle') {
    toggleCapture();
  }
});

function crop(
  image: any,
  area: { x: number; y: number; w: number; h: number },
  dpr: number,
  preserve: number,
  format: string,
  callback: (data: string) => void,
) {
  const top = area.y * dpr;
  const left = area.x * dpr;
  const width = area.w * dpr;
  const height = area.h * dpr;
  const w = dpr !== 1 && preserve ? width : area.w;
  const h = dpr !== 1 && preserve ? height : area.h;

  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  canvas.width = w;
  canvas.height = h;

  const img = new Image();
  img.onload = () => {
    const context = canvas.getContext('2d');
    context?.drawImage(img, left, top, width, height, 0, 0, w, h);
    callback(canvas.toDataURL(`image/${format}`));
  };
  img.src = image;
}
