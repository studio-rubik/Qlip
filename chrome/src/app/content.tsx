import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';

const MARGIN = 20;

let selected: HTMLElement | null = null;
let reactRoot: HTMLDivElement | null = null;
let overlay: HTMLDivElement | null = null;
let keybindings: HTMLDivElement | null = null;
let clickToHide: HTMLDivElement | null = null;
let keybindingsContent: HTMLUListElement | null = null;
let savedOutline = '';
let savedOffset = '';
let savedZIndex = '';

function createReactRoot() {
  const root = document.createElement('div');
  root.style.display = 'none';
  root.setAttribute('id', 'dc-root');
  return root;
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.setAttribute('id', 'dc-overlay');
  return overlay;
}

const keyActions = [
  { key: '[s]', action: 'Capture' },
  { key: '[q]', action: 'Parent' },
  { key: '[w]', action: 'Child' },
];

function createKeybindingsContent() {
  keybindingsContent = document.createElement('ul');
  clickToHide = document.createElement('div');
  clickToHide.innerText = 'Click to hide';
  keyActions.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('dc-key-action');
    const key = document.createElement('div');
    const action = document.createElement('div');
    key.classList.add('dc-key');
    action.classList.add('dc-action');
    key.innerText = item.key;
    action.innerText = item.action;
    keybindingsContent!.appendChild(li);
    li.appendChild(action);
    li.appendChild(key);
  });
}

function createKeybindings() {
  const keybindings = document.createElement('div');
  createKeybindingsContent();
  keybindings.setAttribute('id', 'dc-keybindings');
  keybindings.addEventListener('mouseenter', (e: MouseEvent) => {
    e.stopPropagation();
    if (keybindingsContent && clickToHide) {
      keybindings.replaceChild(clickToHide, keybindingsContent);
    }
  });
  keybindings.addEventListener('mouseleave', () => {
    if (keybindingsContent && clickToHide) {
      keybindings.replaceChild(keybindingsContent, clickToHide);
    }
  });
  keybindings.addEventListener('click', (e) => {
    e.stopPropagation();
    keybindings.style.display = 'none';
  });
  keybindings.appendChild(keybindingsContent!);
  return keybindings;
}

function init() {
  reactRoot = createReactRoot();
  overlay = createOverlay();
  keybindings = createKeybindings();
  document.body.appendChild(reactRoot);
  document.body.appendChild(overlay);
  document.body.appendChild(keybindings);
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
  const target = selected;
  if (keybindings) {
    keybindings.style.display = 'none';
  }
  deselect(selected);
  await tilStyleApplied(target, {
    outline: savedOutline,
    outlineOffset: savedOffset,
    zIndex: savedZIndex,
  });
  const clientRect = target.getBoundingClientRect();
  const rect = {
    x: clientRect.x - MARGIN,
    y: clientRect.y - MARGIN,
    width: clientRect.width + MARGIN * 2,
    height: clientRect.height + MARGIN * 2,
  };
  const dpr = window.devicePixelRatio;
  chrome.runtime.sendMessage(
    {
      type: 'capture.execute',
      area: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      dpr,
    },
    (res) => {
      if (selected == null) return;
      enabled = false;
      disableExtension();
      if (reactRoot != null) {
        reactRoot.style.display = 'block';
      }
      ReactDOM.render(
        <App
          imgURL={res.data}
          originalSize={{ height: rect.height, width: rect.width }}
        />,
        reactRoot,
      );
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
  selected.style.outline = `#619ec988 solid 8px`;
  selected.style.outlineOffset = '-8px';
  selected.style.zIndex = '999999';
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
  if (parent instanceof HTMLElement) {
    deselect(selected);
    select(parent);
  }
}

function selectChild() {
  if (selected == null) return;
  const child = selected.children[0];
  if (child instanceof HTMLElement) {
    deselect(selected);
    select(child);
  }
}

function handleMouseMove(e: MouseEvent) {
  const elms = document.elementsFromPoint(e.x, e.y);
  const elm = elms.filter((e) => e !== overlay)[0];
  if (
    elm !== selected &&
    elm !== keybindings &&
    elm !== keybindingsContent &&
    elm !== clickToHide &&
    elm instanceof HTMLElement
  ) {
    deselect(selected);
    select(elm);
  }
}

function handleClick() {
  capture();
}

function handleKeyDown(e: KeyboardEvent) {
  e.preventDefault();
  e.stopPropagation();
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
  if (overlay && keybindings) {
    overlay.style.display = 'block';
    keybindings.style.display = 'flex';
  }
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeyDown);
  enabled = true;
}

function disableExtension() {
  selected && deselect(selected);
  if (overlay && keybindings) {
    overlay.style.display = 'none';
    keybindings.style.display = 'none';
  }
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('click', handleClick);
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
