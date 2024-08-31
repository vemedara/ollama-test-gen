chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "getPageData") {
    const text = document.body.innerText;
    if (text) {
      sendResponse({ text });
    } 
  }
});
