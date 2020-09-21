import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';

let savedOutline = '';
let savedOffset = '';
let savedZIndex = '';

function init() {
  const reactRoot = document.createElement('div');
  reactRoot.style.display = 'none';
  reactRoot.setAttribute('id', 'dc-root');
  document.body.appendChild(reactRoot);
}

type OutlineStyles = {
  outline: string;
  outlineOffset: string;
  zIndex: string;
};

function tilStyleApplied(
  element: HTMLElement,
  style: OutlineStyles,
): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (
        Object.entries(style).every(
          ([k, v]) => element.style[k as keyof CSSStyleDeclaration] === v,
        )
      ) {
        resolve();
        clearInterval(interval);
        return;
      }
    }, 50);
  });
}

const MARGIN = 20;

function handleMouseOver(e: MouseEvent) {
  const elm = e.target as HTMLElement;
  savedOutline = elm.style.outline;
  savedOffset = elm.style.outlineOffset;
  savedZIndex = elm.style.zIndex;
  elm.style.outline = '#619ec988 solid 5px';
  elm.style.outlineOffset = '-5px';
  elm.style.zIndex = '100000';

  function recover() {
    elm.style.outline = savedOutline;
    elm.style.outlineOffset = savedOffset;
    elm.style.zIndex = savedZIndex;
    savedOutline = '';
    savedOffset = '';
    savedZIndex = '';
  }

  async function handleClick(c: MouseEvent) {
    c.preventDefault();
    c.stopPropagation();
    recover();
    await tilStyleApplied(elm, {
      outline: savedOutline,
      outlineOffset: savedOffset,
      zIndex: savedZIndex,
    });
    const clientRect = elm.getBoundingClientRect();
    const rect = {
      x: clientRect.x - MARGIN,
      y: clientRect.y - MARGIN,
      width: clientRect.width + MARGIN * 2,
      height: clientRect.height + MARGIN * 2,
    };
    chrome.runtime.sendMessage(
      {
        type: 'capture.execute',
        area: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        dpr: devicePixelRatio,
      },
      (res) => {
        enabled = false;
        elm.removeEventListener('click', handleClick);
        document.removeEventListener('mouseover', handleMouseOver);
        const reactRoot = document.getElementById('dc-root');
        if (reactRoot != null) {
          reactRoot.style.display = 'block';
        }
        ReactDOM.render(
          <App imgURL={res.data} originalSize={rect} />,
          reactRoot,
        );
      },
    );
  }

  function remove() {
    recover();
    elm.removeEventListener('click', handleClick);
    elm.removeEventListener('mouseout', remove);
  }

  elm.addEventListener('click', handleClick);
  elm.addEventListener('mouseout', remove);
}

function enableExtension() {
  document.addEventListener('mouseover', handleMouseOver);
}

function disableExtension() {
  document.removeEventListener('mouseover', handleMouseOver);
}

let enabled = false;

chrome.runtime.onMessage.addListener((msg, _, respond) => {
  switch (msg.type) {
    case 'capture.get':
      respond({ type: 'capture.get', data: { value: enabled } });
      break;
    case 'capture.toggle.request':
      enabled = !enabled;
      enabled ? enableExtension() : disableExtension();
      respond();
      break;
    case 'api.component.add':
      break;
    default:
      break;
  }
});

init();
