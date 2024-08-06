chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "captureScreenshot",
      title: "Generate Test Cases",
      contexts: ["all"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "captureScreenshot") {
      
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['style.css']
      }, () => {
        console.log('CSS injected!');
      });

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      },() => {
        console.log('Executed content.js');
      });
    }
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'capture') {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        sendResponse({ screenshotUrl: dataUrl });
      });
      return true; // Keep the message channel open for sendResponse
    }
  });
  