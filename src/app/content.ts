let savedOutline = '';
let savedOffset = '';
let savedZIndex = '';

function handleMouseOver(e: MouseEvent) {
    const elm = e.target as HTMLElement;
    savedOutline = elm.style.outline;
    savedOffset = elm.style.outlineOffset;
    savedZIndex = elm.style.zIndex;
    elm.style.outline = "#619ec988 solid 5px";
    elm.style.outlineOffset = '-5px';
    elm.style.zIndex = '100';

    function remove(l: MouseEvent) {
        elm.style.outline = savedOutline;
        elm.style.outlineOffset = savedOffset;
        elm.style.zIndex = savedZIndex;
        savedOutline = '';
        savedOffset = '';
        savedZIndex = '';
        elm.removeEventListener('mouseout', remove);
    }

    elm.addEventListener('mouseout', remove);
}

function enableExtension() {
    document.addEventListener('mouseover', handleMouseOver);
}

function disableExtension() {
    document.removeEventListener('mouseover', handleMouseOver);
}

let enabled = window.localStorage.getItem('enabled') ?? 'true';
if (enabled === 'true') {
    enableExtension();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.type) {
        case 'enabled':
            msg.value ? enableExtension() : disableExtension();
            break;
        default:
            break;
    }
    console.log(msg.value);
})
