import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';

const MARGIN = 20;

let selected: HTMLElement | null = null;
let reactRoot: HTMLDivElement | null = null;
let instruction: HTMLDivElement | null = null;
let savedOutline = '';
let savedOffset = '';
let savedZIndex = '';

function init() {
  reactRoot = document.createElement('div');
  reactRoot.style.display = 'none';
  reactRoot.setAttribute('id', 'dc-root');
  instruction = document.createElement('div');
  instruction.innerText = 'Press S to capture';
  instruction.addEventListener('click', () => {
    instruction!.style.display = 'none';
  });
  instruction.setAttribute('id', 'dc-instruction');
  document.body.appendChild(reactRoot);
  document.body.appendChild(instruction);
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
      if (reactRoot != null) {
        reactRoot.style.display = 'block';
      }
      ReactDOM.render(<App imgURL={res.data} originalSize={rect} />, reactRoot);
    },
  );
}

function select(elm: HTMLElement | null = null) {
  deselect(selected);
  if (elm == null) return;
  selected = elm;
  savedOutline = selected.style.outline;
  savedOffset = selected.style.outlineOffset;
  savedZIndex = selected.style.zIndex;
  const color = selected === instruction ? '#db373788' : '#619ec988';
  selected.style.outline = `${color} solid 5px`;
  selected.style.outlineOffset = '-5px';
  selected.style.zIndex = '100000';
}

function deselect(elm: HTMLElement | null = null) {
  if (elm == null) return;
  elm.style.outline = savedOutline;
  elm.style.outlineOffset = savedOffset;
  elm.style.zIndex = savedZIndex;
  savedOutline = '';
  savedOffset = '';
  savedZIndex = '';
}

function selectParent() {
  if (selected == null) return;
  const parent = selected.parentNode;
  if (parent) {
    deselect(selected);
    select(parent as HTMLElement);
  }
}

function selectChild() {
  if (selected == null) return;
  const child = selected.children[0];
  if (child) {
    deselect(selected);
    select(child as HTMLElement);
  }
}

function handleMouseOver(e: MouseEvent) {
  select(e.target as HTMLElement);
}

function handleMouseOut(e: MouseEvent) {
  deselect(e.target as HTMLElement);
}

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 's':
      capture();
      break;
    case 'q':
      selectParent();
      break;
    case 'w':
      selectChild();
      break;
    case 'Escape':
      disableExtension();
      break;
  }
}

let enabled = false;

function enableExtension() {
  if (instruction) {
    instruction.style.display = 'block';
  }
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('keydown', handleKeyDown);
  enabled = true;
}

function disableExtension() {
  selected && deselect(selected);
  if (instruction) {
    instruction.style.display = 'none';
  }
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('keydown', handleKeyDown);
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
