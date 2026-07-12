// Social Save Background Service Worker

async function configureActionBehavior() {
  const result = await new Promise(resolve => {
    chrome.storage.local.get(["viewStyle"], resolve);
  });
  const viewStyle = result.viewStyle || "sidepanel";
  
  if (viewStyle === "popup") {
    // Set popup to popup.html
    chrome.action.setPopup({ popup: "popup.html" });
  } else {
    // Clear popup so that icon click triggers side panel opening
    chrome.action.setPopup({ popup: "" });
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
  }
}

// Run on startup and install
chrome.runtime.onInstalled.addListener(configureActionBehavior);
chrome.runtime.onStartup.addListener(configureActionBehavior);

// Listen for storage changes (when user updates settings)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.viewStyle) {
    configureActionBehavior();
  }
});

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
