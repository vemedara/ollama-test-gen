chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open Side Panel",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSidePanel") {
    chrome.tabs.query({
			active: true,
			lastFocusedWindow: true
		}, function(tabs){
			var tab = tabs[0];
			if(tab){
				var currentpage = tab.url;
				chrome.sidePanel.open({windowId: tab.windowId}, function(){
					setTimeout(function(){
						chrome.runtime.sendMessage({msg: "setpage", value: currentpage});
					}, 500);
				});
			}
		});
  }
});

if (chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
} else {
  chrome.action.onClicked.addListener(() => {
    chrome.notifications.create({
      type: "basic",
      title: "Unsupported",
      iconUrl: chrome.runtime.getURL("icon.png"),
      message: "Please upgrade your Chrome browser to version 114+",
    });
  });
}

chrome.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: [1],
  addRules: [
    {
      id: 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          {
            header: "user-agent",
            operation: "set",
            value:
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41",
          },
          {
            header: "sec-ch-ua",
            operation: "set",
            value: '"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
          },
          {
            header: "Content-Security-Policy",
            operation: "set",
            value: `frame-ancestors 'self' https://chatgpt.com/`,
          },
        ],
        responseHeaders: [
          { header: "x-frame-options", operation: "remove" },
          { header: "content-security-policy", operation: "remove" }
        ],
      },
      condition: {
        urlFilter: "chatgpt.com",
        isUrlFilterCaseSensitive: false,
        resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "websocket"],
      },
    },
  ],
});
