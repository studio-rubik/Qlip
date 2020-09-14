import React from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';

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

window.addEventListener('load', init, false);

function handleMouseOver(e: MouseEvent) {
  const elm = e.target as HTMLElement;
  savedOutline = elm.style.outline;
  savedOffset = elm.style.outlineOffset;
  savedZIndex = elm.style.zIndex;
  elm.style.outline = '#619ec988 solid 5px';
  elm.style.outlineOffset = '-5px';
  elm.style.zIndex = '100';

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
    const rect = elm.getBoundingClientRect();
    chrome.runtime.sendMessage(
      {
        message: 'capture',
        area: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        dpr: devicePixelRatio,
      },
      (res) => {
        enabled = false;
        elm.removeEventListener('click', handleClick);
        document.removeEventListener('mouseover', handleMouseOver);
        const reactRoot = document.getElementById('dc-root');
        reactRoot.style.display = 'block';
        document.body.classList.add('locked');
        ReactDOM.render(<App imgURL={res.image} />, reactRoot);
      }
    );
  }

  function remove(l: MouseEvent) {
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'toggle':
      enabled = !enabled;
      enabled ? enableExtension() : disableExtension();
      break;
    default:
      break;
  }
});
