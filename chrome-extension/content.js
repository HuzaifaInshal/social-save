// Content script runs in the context of the social-save web application.
// It relays messages between the Chrome Extension popup and the web page.

console.log("[Social Save Extension] Content script loaded.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "PING") {
    sendResponse({ status: "CONNECTED" });
    return true;
  }

  // Define response handler
  const handleResponse = (e) => {
    if (e.detail.action === message.action) {
      window.removeEventListener("SOCIAL_SAVE_EXT_RESPONSE", handleResponse);
      sendResponse(e.detail.response);
    }
  };

  // Listen for the response from the page
  window.addEventListener("SOCIAL_SAVE_EXT_RESPONSE", handleResponse);

  // Relay the request to the Next.js page
  const requestEvent = new CustomEvent("SOCIAL_SAVE_EXT_REQUEST", {
    detail: { action: message.action, payload: message.payload }
  });
  window.dispatchEvent(requestEvent);

  // Return true to indicate we will send response asynchronously
  return true;
});
