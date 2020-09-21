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

let selected: HTMLElement | null = null;

function recover(elm: HTMLElement) {
  if (elm) {
    elm.style.outline = savedOutline;
    elm.style.outlineOffset = savedOffset;
    elm.style.zIndex = savedZIndex;
  }
  savedOutline = '';
  savedOffset = '';
  savedZIndex = '';
}

function handleMouseOut(e: MouseEvent) {
  recover(e.target as HTMLElement);
}

async function capture() {
  if (selected == null) return;
  disableExtension();
  await tilStyleApplied(selected, {
    outline: savedOutline,
    outlineOffset: savedOffset,
    zIndex: savedZIndex,
  });
  const clientRect = selected.getBoundingClientRect();
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
      if (selected == null) return;
      enabled = false;
      selected.removeEventListener('click', capture);
      document.removeEventListener('mouseover', handleMouseOver);
      const reactRoot = document.getElementById('dc-root');
      if (reactRoot != null) {
        reactRoot.style.display = 'block';
      }
      ReactDOM.render(<App imgURL={res.data} originalSize={rect} />, reactRoot);
    },
  );
}

function handleMouseOver(e: MouseEvent) {
  selected = e.target as HTMLElement;
  savedOutline = selected.style.outline;
  savedOffset = selected.style.outlineOffset;
  savedZIndex = selected.style.zIndex;
  selected.style.outline = '#619ec988 solid 5px';
  selected.style.outlineOffset = '-5px';
  selected.style.zIndex = '100000';
}

let enabled = false;

function enableExtension() {
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', capture);
  enabled = true;
}

function disableExtension() {
  selected && recover(selected);
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('click', capture);
  enabled = false;
}

chrome.runtime.onMessage.addListener((msg, _, respond) => {
  switch (msg.type) {
    case 'capture.get':
      respond({ type: 'capture.get', data: { value: enabled } });
      break;
    case 'capture.toggle.request':
      enabled ? disableExtension() : enableExtension();
      respond();
      break;
    case 'api.component.add':
      break;
    default:
      break;
  }
});

init();
