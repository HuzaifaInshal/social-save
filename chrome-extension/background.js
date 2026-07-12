// Social Save Background Service Worker

// Enable opening side panel when user clicks extension icon in toolbar
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SAVE_CREDENTIALS") {
    const { firebaseConfig, refreshToken, uid } = message.payload;
    chrome.storage.local.set({
      firebaseConfig,
      refreshToken,
      uid
    }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true });
      }
    });
    return true; // Keep message channel open for asynchronous response
  }
});
