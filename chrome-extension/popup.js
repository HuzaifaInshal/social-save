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

async function getConnectUrl() {
  const tab = await findWebAppTab();
  if (tab && tab.url) {
    try {
      const parsed = new URL(tab.url);
      return `${parsed.origin}/connect-extension`;
    } catch {}
  }
  return "http://localhost:3000/connect-extension";
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

// Firebase REST API helpers
async function refreshAuthToken(apiKey, refreshToken) {
  const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  
  if (!res.ok) {
    throw new Error("Failed to refresh token: " + res.statusText);
  }
  
  const data = await res.json();
  return {
    idToken: data.access_token,
    refreshToken: data.refresh_token,
    uid: data.user_id
  };
}

async function restFetchCollections(projectId, idToken, uid) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "collections" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "ownerId" },
          op: "EQUAL",
          value: { stringValue: uid }
        }
      }
    }
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to fetch collections: " + res.statusText);
  const data = await res.json();
  return data
    .filter(item => item.document)
    .map(item => {
      const doc = item.document;
      const fields = doc.fields;
      const id = doc.name.split("/").pop();
      return {
        id,
        title: fields.title?.stringValue || "",
        parentId: fields.parentId?.stringValue || null
      };
    });
}

async function restFetchPosts(projectId, idToken, uid) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "posts" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "ownerId" },
          op: "EQUAL",
          value: { stringValue: uid }
        }
      }
    }
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to fetch posts: " + res.statusText);
  const data = await res.json();
  return data
    .filter(item => item.document)
    .map(item => {
      const doc = item.document;
      const fields = doc.fields;
      const id = doc.name.split("/").pop();
      return {
        id,
        link: fields.link?.stringValue || "",
        title: fields.title?.stringValue || "",
        collectionId: fields.collectionId?.stringValue || null
      };
    });
}

const getPlatformFromLink = (url) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("instagram.com")) return "Instagram";
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "YouTube";
    if (hostname.includes("tiktok.com")) return "TikTok";
    if (hostname.includes("facebook.com")) return "Facebook";
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "Twitter / X";
    if (hostname.includes("linkedin.com")) return "LinkedIn";
    if (hostname.includes("pinterest.com")) return "Pinterest";
    if (hostname.includes("reddit.com")) return "Reddit";
    return "Web";
  } catch {
    return "Web";
  }
};

async function restAddBookmark(projectId, idToken, uid, { title, description, link, collectionId }) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts`;
  const fields = {
    ownerId: { stringValue: uid },
    title: { stringValue: title },
    description: { stringValue: description || "" },
    link: { stringValue: link },
    platform: { stringValue: getPlatformFromLink(link) },
    createdAt: { doubleValue: Date.now() },
    updatedAt: { doubleValue: Date.now() }
  };

  if (collectionId) {
    fields.collectionId = { stringValue: collectionId };
  } else {
    fields.collectionId = { nullValue: null };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Failed to create bookmark");
  }
  return true;
}

async function restRemoveBookmark(projectId, idToken, postId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts/${postId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Failed to remove bookmark");
  }
  return true;
}

// Memory caches
let cachedCollections = null;
let cachedPosts = null;
let cachedOfflineData = null;

async function initPanel() {
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
    document.getElementById("loading-message").textContent = "Navigate to a website to bookmark it.";
    showState("state-loading");
    updateConnectionHeader(false, "Unsupported URL");
    return;
  }

  const pageUrl = activeTab.url;
  const pageTitle = activeTab.title || "Untitled Post";

  // Bind Connect/Open Dashboard CTA
  document.getElementById("btn-open-dashboard").onclick = async () => {
    const url = await getConnectUrl();
    chrome.tabs.create({ url });
  };

  // 2. Load cached credentials and configuration
  const cached = await new Promise(resolve => {
    chrome.storage.local.get(["firebaseConfig", "refreshToken", "uid"], resolve);
  });

  if (!cached || !cached.firebaseConfig || !cached.refreshToken || !cached.uid) {
    updateConnectionHeader(false, "Not Connected");
    showState("state-disconnected");
    return;
  }

  try {
    updateConnectionHeader(true, "Connected");
    
    // Refresh token if we don't have offlineData or if we need to load initially
    if (!cachedOfflineData) {
      const fresh = await refreshAuthToken(cached.firebaseConfig.apiKey, cached.refreshToken);
      
      // Cache the new refresh token
      await new Promise(resolve => {
        chrome.storage.local.set({ refreshToken: fresh.refreshToken }, resolve);
      });
      
      cachedOfflineData = {
        idToken: fresh.idToken,
        projectId: cached.firebaseConfig.projectId,
        uid: cached.uid
      };
    }

    if (!cachedCollections || !cachedPosts) {
      cachedCollections = await restFetchCollections(cachedOfflineData.projectId, cachedOfflineData.idToken, cachedOfflineData.uid);
      cachedPosts = await restFetchPosts(cachedOfflineData.projectId, cachedOfflineData.idToken, cachedOfflineData.uid);
    }
  } catch (err) {
    console.error("Authentication/Fetch failed:", err);
    // Reset caches on failure
    cachedOfflineData = null;
    cachedCollections = null;
    cachedPosts = null;

    if (err.message.includes("400") || err.message.includes("refresh token")) {
      await new Promise(resolve => {
        chrome.storage.local.remove(["firebaseConfig", "refreshToken", "uid"], resolve);
      });
    }
    updateConnectionHeader(false, "Connection Error");
    showState("state-disconnected");
    return;
  }

  const collections = cachedCollections;
  const posts = cachedPosts;

  // 3. Check if current page is already bookmarked
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
        await restRemoveBookmark(cachedOfflineData.projectId, cachedOfflineData.idToken, existingBookmark.id);
        // Clear caches to force refetch
        cachedCollections = null;
        cachedPosts = null;
        initPanel();
      } catch (err) {
        alert("Failed to unbookmark: " + err.message);
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
    select.innerHTML = '<option value="">Root level (no collection)</option>';
    
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
        await restAddBookmark(cachedOfflineData.projectId, cachedOfflineData.idToken, cachedOfflineData.uid, {
          title, description, link: pageUrl, collectionId
        });
        // Clear caches to force refetch
        cachedCollections = null;
        cachedPosts = null;
        initPanel();
      } catch (err) {
        alert("Failed to save bookmark: " + err.message);
        document.getElementById("btn-bookmark").disabled = false;
        document.getElementById("btn-bookmark").textContent = "Save Bookmark";
      }
    };

    showState("state-form");
  }
}

// Main DOM entry
document.addEventListener("DOMContentLoaded", () => {
  initPanel();
});

// Dynamic Tab Switching & Updating
chrome.tabs.onActivated.addListener(() => {
  initPanel();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    initPanel();
  }
});
