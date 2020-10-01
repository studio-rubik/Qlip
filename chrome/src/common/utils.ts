export function clone(node: Node): Node {
  if (node instanceof HTMLIFrameElement) {
    console.debug("can't clone iframe.");
  }
  const cloned = node.cloneNode(false);
  if (node instanceof HTMLElement) {
    const style = window.getComputedStyle(node as HTMLElement);
    (cloned as HTMLElement).style.cssText = style.cssText;
  }
  for (const c of Array.from(node.childNodes)) {
    cloned.appendChild(clone(c));
  }
  return cloned;
}

export function getSize(
  target: Element,
  margin: number,
): { x: number; y: number; w: number; h: number; dpr: number } {
  const rect = target.getBoundingClientRect();
  return {
    x: rect.x - margin,
    y: rect.y - margin,
    w: rect.width + margin * 2,
    h: rect.height + margin * 2,
    dpr: window.devicePixelRatio,
  };
}

export function captureDOM(
  target: Element,
  options?: { margin?: number },
): Promise<{
  dataURL: string;
  originalSize: { width: number; height: number };
}> {
  const margin = options?.margin ?? 0;
  const size = getSize(target, margin);

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'capture.execute',
        area: { x: size.x, y: size.y, w: size.w, h: size.h },
        dpr: size.dpr,
      },
      (resp) => {
        resolve({
          dataURL: resp.data,
          originalSize: { width: size.w, height: size.h },
        });
      },
    );
  });
}
