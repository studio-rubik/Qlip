import './hot-reload';

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

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'capture') {
    chrome.tabs.getSelected(null, (tab) => {
      chrome.tabs.captureVisibleTab(
        tab.windowId,
        { format: 'png' },
        (image) => {
          // image is base64
          crop(image, req.area, req.dpr, req.dpr, 'png', (cropped) => {
            res({ message: 'image', image: cropped });
          });
        }
      );
    });
  }
  return true;
});

function crop(image, area, dpr, preserve, format, done) {
  var top = area.y * dpr;
  var left = area.x * dpr;
  var width = area.w * dpr;
  var height = area.h * dpr;
  var w = dpr !== 1 && preserve ? width : area.w;
  var h = dpr !== 1 && preserve ? height : area.h;

  var canvas = null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  }
  canvas.width = w;
  canvas.height = h;

  var img = new Image();
  img.onload = () => {
    var context = canvas.getContext('2d');
    context.drawImage(img, left, top, width, height, 0, 0, w, h);

    var cropped = canvas.toDataURL(`image/${format}`);
    done(cropped);
  };
  img.src = image;
}
