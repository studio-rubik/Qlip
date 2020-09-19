import { API_URL } from './globals';
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

chrome.browserAction.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle' });
  }
});

let idToken = '';

function startSignInFlow(res: any) {
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
        idToken = redirectedTo?.split('#', 2)[1] ?? '';
        console.log(idToken);
      }
    },
  );
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

async function componentAdd(msg: ComponentAddMsg) {
  const fd = new FormData();
  fd.append('domain', msg.domain);
  fd.append('name', 'component_name');
  fd.append('file', await utils.dataUrlToFile(msg.dataURL, 'file'));
  const resp = await fetch(`${API_URL}/components`, {
    method: 'post',
    body: fd,
  });
}

chrome.runtime.onMessage.addListener((msg, _, res) => {
  switch (msg.type) {
    case 'signIn':
      startSignInFlow(res);
      break;
    case 'capture':
      handleCaptureMsg(msg, res);
      break;
    case 'api.component.add':
      componentAdd(msg);
      break;
    default:
      break;
  }
  return true;
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

  const img = new Image();
  img.onload = () => {
    const context = canvas.getContext('2d');
    context?.drawImage(img, left, top, width, height, 0, 0, w, h);
    callback(canvas.toDataURL(`image/${format}`));
  };
  img.src = image;
}
