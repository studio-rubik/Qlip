import './hot-reload';

import * as utils from './utils';

function publish(msg: any) {
  chrome.windows.getAll({ populate: true }, function (window_list) {
    for (let i = 0; i < window_list.length; i++) {
      const window = window_list[i];
      for (let j = 0; j < window.tabs.length; j++) {
        const tab = window.tabs[j];
        chrome.tabs.sendMessage(tab.id, msg);
      }
    }
  });
}

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'toggle' });
});

let userID = '';

chrome.identity.getProfileUserInfo((info) => {
  userID = info.id;
});

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
  res: (respData: CaptureMsgResp) => void
) {
  chrome.tabs.query({ active: true }, (tab) => {
    chrome.tabs.captureVisibleTab(
      tab[0].windowId,
      { format: 'png' },
      (image) => {
        crop(image, msg.area, msg.dpr, msg.dpr, 'png', (cropped) => {
          res({ type: 'capture', data: cropped });
        });
      }
    );
  });
}

type Headers = {
  'DomClipper-ID': string;
};

async function componentAdd(msg: ComponentAddMsg, res: () => void) {
  console.log('add');
  const fd = new FormData();
  fd.append('domain', msg.domain);
  fd.append('name', 'component_name');
  fd.append('file', await utils.dataUrlToFile(msg.dataURL, 'file'));
  const resp = await fetch(`${API_URL}/components`, {
    method: 'post',
    headers: { 'DomClipper-User-ID': userID },
    body: fd,
  });
}

chrome.runtime.onMessage.addListener((msg, sender, res) => {
  switch (msg.type) {
    case 'capture':
      handleCaptureMsg(msg, res);
      break;
    case 'api.component.add':
      componentAdd(msg, res);
      break;
    default:
      break;
  }
  return true;
});

function crop(
  image,
  area,
  dpr,
  preserve,
  format,
  callback: (data: string) => void
) {
  var top = area.y * dpr;
  var left = area.x * dpr;
  var width = area.w * dpr;
  var height = area.h * dpr;
  var w = dpr !== 1 && preserve ? width : area.w;
  var h = dpr !== 1 && preserve ? height : area.h;

  let canvas: HTMLCanvasElement = null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  }
  canvas.width = w;
  canvas.height = h;

  const img = new Image();
  img.onload = () => {
    var context = canvas.getContext('2d');
    context.drawImage(img, left, top, width, height, 0, 0, w, h);
    callback(canvas.toDataURL(`image/${format}`));
  };
  img.src = image;
}
