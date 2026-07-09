// Social Save extension popup controller

const webAppPatterns = [
  "*://localhost/*",
  "*://127.0.0.1/*",
  "*://social-save.vercel.app/*",
  "*://*.web.app/*",
  "*://*.firebaseapp.com/*"
];

// Helper to find a web app tab
async function findWebAppTab() {
  for (const pattern of webAppPatterns) {
    const tabs = await new Promise(resolve => {
      chrome.tabs.query({ url: pattern }, resolve);
    });
    if (tabs && tabs.length > 0) {
      return tabs[0];
    }
  }
  return null;
}

// Show a specific UI state
function showState(stateId) {
  document.querySelectorAll(".state").forEach(el => el.classList.remove("active"));
  document.getElementById(stateId).classList.add("active");
}

// Update connection header
function updateConnectionHeader(connected, text = "Connected") {
  const dot = document.getElementById("connection-dot");
  const lbl = document.getElementById("connection-text");
  
  if (connected) {
    dot.classList.add("connected");
    lbl.textContent = text;
  } else {
    dot.classList.remove("connected");
    lbl.textContent = text;
  }
}

// Main logic
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Get active page info
  let activeTab;
  try {
    const tabs = await new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
    activeTab = tabs[0];
  } catch (e) {
    console.error("Error getting active tab:", e);
  }

  if (!activeTab || !activeTab.url || activeTab.url.startsWith("chrome://")) {
    document.getElementById("loading-message").textContent = "Unsupported page URL.";
    showState("state-loading");
    updateConnectionHeader(false, "Unsupported URL");
    return;
  }

  const pageUrl = activeTab.url;
  const pageTitle = activeTab.title || "Untitled Post";

  // Bind Open Dashboard CTA
  document.getElementById("btn-open-dashboard").onclick = () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  };

  // 2. Try to connect to Social Save web app
  const webAppTab = await findWebAppTab();
  if (!webAppTab) {
    updateConnectionHeader(false, "Disconnected");
    showState("state-disconnected");
    return;
  }

  // Ping the content script
  let isConnected = false;
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(webAppTab.id, { action: "PING" }, (res) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(res);
        }
      });
    });
    isConnected = response && response.status === "CONNECTED";
  } catch (err) {
    console.warn("Ping failed, bridge not ready.", err);
  }

  if (!isConnected) {
    updateConnectionHeader(false, "Bridge Offline");
    showState("state-disconnected");
    return;
  }

  updateConnectionHeader(true, "Connected");

  // 3. Retrieve auth state, collections, and existing bookmarks
  let appState;
  try {
    appState = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(webAppTab.id, { action: "GET_STATUS" }, (res) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(res);
        }
      });
    });
  } catch (err) {
    console.error("Error getting state:", err);
    updateConnectionHeader(false, "Connection Error");
    showState("state-disconnected");
    return;
  }

  if (!appState || !appState.authenticated) {
    updateConnectionHeader(false, "Authentication Required");
    document.getElementById("loading-message").textContent = "Please sign in to the web app first.";
    showState("state-loading");
    return;
  }

  const { collections, posts } = appState;

  // 4. Check if current page is already bookmarked
  // We can normalize URL (strip query parameters or trailing slashes for loose match)
  const normalizeUrl = (u) => {
    try {
      const parsed = new URL(u);
      return parsed.origin + parsed.pathname.replace(/\/$/, "");
    } catch {
      return u;
    }
  };

  const normalizedPageUrl = normalizeUrl(pageUrl);
  const existingBookmark = posts.find(p => normalizeUrl(p.link) === normalizedPageUrl);

  if (existingBookmark) {
    // Already bookmarked state
    const savedCollection = collections.find(c => c.id === existingBookmark.collectionId);
    const collectionTitle = savedCollection ? savedCollection.title : "Root level";
    
    document.getElementById("lbl-saved-message").textContent = `Saved in: ${collectionTitle}`;
    document.getElementById("txt-saved-url").textContent = existingBookmark.link;
    
    // Bind Unbookmark click
    document.getElementById("btn-unbookmark").onclick = async () => {
      document.getElementById("btn-unbookmark").disabled = true;
      document.getElementById("btn-unbookmark").textContent = "Removing...";
      
      try {
        const res = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(webAppTab.id, {
            action: "REMOVE_BOOKMARK",
            payload: { link: existingBookmark.link }
          }, (response) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(response);
          });
        });
        
        if (res && res.success) {
          window.location.reload(); // Refresh popup to show form state
        } else {
          alert("Failed to unbookmark: " + (res?.error || "Unknown error"));
          document.getElementById("btn-unbookmark").disabled = false;
          document.getElementById("btn-unbookmark").textContent = "Remove Bookmark";
        }
      } catch (err) {
        alert("Error: " + err.message);
        document.getElementById("btn-unbookmark").disabled = false;
        document.getElementById("btn-unbookmark").textContent = "Remove Bookmark";
      }
    };
    
    showState("state-bookmarked");
  } else {
    // Unsaved page - show form to bookmark
    document.getElementById("txt-page-url").textContent = pageUrl;
    document.getElementById("inp-title").value = pageTitle;

    // Populating Collections dropdown
    const select = document.getElementById("sel-collection");
    
    // Simple indentation helper for subfolders if they have a parentId structure
    const map = new Map(collections.map(c => [c.id, { ...c, depth: 0 }]));
    
    // Calculate depths
    let changed = true;
    while (changed) {
      changed = false;
      for (const [id, item] of map.entries()) {
        if (item.parentId && map.has(item.parentId)) {
          const parent = map.get(item.parentId);
          const newDepth = parent.depth + 1;
          if (item.depth !== newDepth) {
            item.depth = newDepth;
            changed = true;
          }
        }
      }
    }

    // Sort by title and render
    const sortedCollections = Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
    
    sortedCollections.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      // Pre-fill indent with spaces to represent structure
      option.textContent = "\u00A0\u00A0".repeat(c.depth) + (c.depth > 0 ? "↳ " : "") + c.title;
      select.appendChild(option);
    });

    // Bind Bookmark click
    document.getElementById("btn-bookmark").onclick = async () => {
      const title = document.getElementById("inp-title").value.trim();
      const description = document.getElementById("inp-description").value.trim();
      const collectionId = document.getElementById("sel-collection").value || null;

      if (!title) {
        alert("Please enter a title.");
        return;
      }

      document.getElementById("btn-bookmark").disabled = true;
      document.getElementById("btn-bookmark").textContent = "Saving...";

      try {
        const res = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(webAppTab.id, {
            action: "ADD_BOOKMARK",
            payload: { title, description, link: pageUrl, collectionId }
          }, (response) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(response);
          });
        });

        if (res && res.success) {
          window.location.reload(); // Refresh popup to show bookmarked state
        } else {
          alert("Failed to save: " + (res?.error || "Unknown error"));
          document.getElementById("btn-bookmark").disabled = false;
          document.getElementById("btn-bookmark").textContent = "Save Bookmark";
        }
      } catch (err) {
        alert("Error: " + err.message);
        document.getElementById("btn-bookmark").disabled = false;
        document.getElementById("btn-bookmark").textContent = "Save Bookmark";
      }
    };

    showState("state-form");
  }
});
