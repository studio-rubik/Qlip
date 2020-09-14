import './hot-reload'

function publish(msg: any) {
    chrome.windows.getAll({populate : true}, function (window_list) {
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
    chrome.storage.local.get(({ enabled }) => {
        console.log(enabled);
        const newVal = !(enabled == null || enabled === true)
        publish({type: 'enabled', value: newVal});
        chrome.storage.local.set({enabled: newVal});
    }) ;
});
