// Social Save extension popup controller

// Immediately load and apply theme to prevent flashing
(async () => {
  const result = await new Promise(resolve => {
    chrome.storage.local.get(["theme"], resolve);
  });
  let theme = "light";
  if (result && result.theme) {
    theme = result.theme;
  } else {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();

// Custom Select Component References
let selectedCollectionId = null;
let collectionSelect = null;
let viewStyleSelect = null;
let lastSelectedCollectionId = "";

// Immediately load stored collection preference to sync dropdowns across tabs
chrome.storage.local.get(["lastSelectedCollectionId"], (res) => {
  if (res && res.lastSelectedCollectionId) {
    lastSelectedCollectionId = res.lastSelectedCollectionId;
  }
});

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
      const tags = fields.tags?.arrayValue?.values
        ? fields.tags.arrayValue.values.map(v => v.stringValue).filter(Boolean)
        : [];
      return {
        id,
        title: fields.title?.stringValue || "",
        parentId: fields.parentId?.stringValue || null,
        tags
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
      const rating = fields.rating?.integerValue
        ? parseInt(fields.rating.integerValue, 10)
        : fields.rating?.doubleValue
        ? Math.round(fields.rating.doubleValue)
        : 0;
      const tags = fields.tags?.arrayValue?.values
        ? fields.tags.arrayValue.values.map(v => v.stringValue).filter(Boolean)
        : [];
      return {
        id,
        link: fields.link?.stringValue || "",
        title: fields.title?.stringValue || "",
        collectionId: fields.collectionId?.stringValue || null,
        rating,
        tags
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

async function restAddBookmark(projectId, idToken, uid, { title, description, link, collectionId, rating, tags }) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts`;
  const fields = {
    ownerId: { stringValue: uid },
    title: { stringValue: title },
    description: { stringValue: description || "" },
    link: { stringValue: link },
    platform: { stringValue: getPlatformFromLink(link) },
    rating: { integerValue: rating || 0 },
    tags: {
      arrayValue: {
        values: (tags || []).map(t => ({ stringValue: t }))
      }
    },
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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to create bookmark");
  }
  const parts = data.name.split("/");
  return parts[parts.length - 1];
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

// Rating & Tag State Management
let selectedRating = 0;
let selectedTags = [];

function updateRatingUI(rating) {
  selectedRating = rating;
  const container = document.getElementById("star-rating-container");
  if (!container) return;
  const btns = container.querySelectorAll(".star-btn");
  btns.forEach((btn) => {
    const val = parseInt(btn.getAttribute("data-value"), 10);
    if (val <= rating) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  const lbl = document.getElementById("lbl-rating-text");
  if (lbl) {
    lbl.textContent = rating > 0 ? `${rating} / 5 stars` : "Unrated";
  }
}

function initStarRatingEvents() {
  const container = document.getElementById("star-rating-container");
  if (!container) return;
  const btns = container.querySelectorAll(".star-btn");
  btns.forEach((btn) => {
    const val = parseInt(btn.getAttribute("data-value"), 10);
    btn.onclick = (e) => {
      e.preventDefault();
      const newRating = selectedRating === val ? 0 : val;
      updateRatingUI(newRating);
    };
    btn.onmouseenter = () => {
      btns.forEach((b) => {
        const v = parseInt(b.getAttribute("data-value"), 10);
        if (v <= val) b.classList.add("hovered");
        else b.classList.remove("hovered");
      });
    };
    btn.onmouseleave = () => {
      btns.forEach((b) => b.classList.remove("hovered"));
    };
  });
}

function getInheritedTags(collectionId, collections) {
  const collectionMap = new Map();
  (collections || []).forEach((c) => collectionMap.set(c.id, c));

  const tags = new Set();

  if (!collectionId) {
    (collections || []).forEach((c) => (c.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags);
  }

  let currentId = collectionId;
  const visited = new Set();

  while (currentId && collectionMap.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const col = collectionMap.get(currentId);
    if (!col) break;
    (col.tags || []).forEach((tag) => tags.add(tag));
    currentId = col.parentId;
  }

  return Array.from(tags);
}

function renderSelectableTags(collectionId, collections) {
  const container = document.getElementById("tag-chips-container");
  const hint = document.getElementById("lbl-tag-hint");
  if (!container || !hint) return;

  const availableTags = getInheritedTags(collectionId, collections);
  container.innerHTML = "";

  if (availableTags.length === 0) {
    container.style.display = "none";
    hint.style.display = "block";
    selectedTags = [];
    return;
  }

  container.style.display = "flex";
  hint.style.display = "none";

  // Filter selectedTags to keep only tags present in availableTags
  selectedTags = selectedTags.filter((t) => availableTags.includes(t));

  availableTags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    const isSelected = selectedTags.includes(tag);
    btn.className = `tag-chip ${isSelected ? "selected" : ""}`;
    btn.textContent = `${isSelected ? "✓ " : "+ "}${tag}`;
    btn.onclick = (e) => {
      e.preventDefault();
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter((t) => t !== tag);
      } else {
        selectedTags.push(tag);
      }
      renderSelectableTags(collectionId, collections);
    };
    container.appendChild(btn);
  });
}

async function initPanel() {
  // Fetch collection select persistence value and autoFetchTitle setting first
  let autoFetchTitle = true;
  try {
    const storageRes = await new Promise(resolve => {
      chrome.storage.local.get(["lastSelectedCollectionId", "autoFetchTitle"], resolve);
    });
    if (storageRes) {
      if (storageRes.lastSelectedCollectionId !== undefined) {
        lastSelectedCollectionId = storageRes.lastSelectedCollectionId;
      }
      if (storageRes.autoFetchTitle !== undefined) {
        autoFetchTitle = storageRes.autoFetchTitle;
      }
    }
  } catch (e) {
    console.error("Error loading settings:", e);
  }

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

    const metaContainer = document.getElementById("saved-meta-container");
    const starsDisplay = document.getElementById("saved-stars-display");
    const tagsDisplay = document.getElementById("saved-tags-display");

    if ((existingBookmark.rating && existingBookmark.rating > 0) || (existingBookmark.tags && existingBookmark.tags.length > 0)) {
      metaContainer.style.display = "block";

      if (existingBookmark.rating && existingBookmark.rating > 0) {
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<span class="star-btn ${i <= existingBookmark.rating ? 'active' : ''}" style="cursor: default;">★</span>`;
        }
        starsDisplay.innerHTML = `
          ${starsHtml}
          <span class="star-rating-label">${existingBookmark.rating} / 5 stars</span>
        `;
      } else {
        starsDisplay.innerHTML = "";
      }

      if (existingBookmark.tags && existingBookmark.tags.length > 0) {
        tagsDisplay.innerHTML = existingBookmark.tags.map(t => `<span class="card-tag-pill">${t}</span>`).join("");
      } else {
        tagsDisplay.innerHTML = "";
      }
    } else {
      metaContainer.style.display = "none";
    }
    
    // Bind Unbookmark click
    document.getElementById("btn-unbookmark").onclick = async () => {
      document.getElementById("btn-unbookmark").disabled = true;
      document.getElementById("btn-unbookmark").innerHTML = `<div class="spinner" style="margin-bottom: 0; display: inline-block; vertical-align: middle; margin-right: 0.4rem;"></div> Removing...`;
      
      try {
        await restRemoveBookmark(cachedOfflineData.projectId, cachedOfflineData.idToken, existingBookmark.id);
        // Clear caches to force refetch
        cachedCollections = null;
        cachedPosts = null;
        initPanel();
      } catch (err) {
        alert("Failed to unbookmark: " + err.message);
        document.getElementById("btn-unbookmark").disabled = false;
        document.getElementById("btn-unbookmark").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; margin-right: 0.45rem;"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg> Remove Bookmark`;
      }
    };
    
    showState("state-bookmarked");
  } else {
    // Unsaved page - show form to bookmark
    document.getElementById("txt-page-url").textContent = pageUrl;
    document.getElementById("inp-title").value = autoFetchTitle ? pageTitle : "";

    // Reset Rating and Tags selection state for new post
    updateRatingUI(0);
    selectedTags = [];

    // Populate collections using plain nested tree hierarchy (without alphabetical sorting)
    const options = buildNestedCollectionOptions(collections);

    // Always reset Save Bookmark button back to original active state when rendering the form state
    const btnBookmark = document.getElementById("btn-bookmark");
    btnBookmark.disabled = false;
    btnBookmark.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; margin-right: 0.45rem;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save Bookmark`;

    if (collectionSelect) {
      collectionSelect.updateOptions(options);
      // Persist dropdown value across tabs/refetches using lastSelectedCollectionId
      const exists = options.some(o => o.value === lastSelectedCollectionId);
      if (exists) {
        collectionSelect.setValue(lastSelectedCollectionId);
        selectedCollectionId = lastSelectedCollectionId || null;
      } else {
        collectionSelect.setValue("");
        selectedCollectionId = null;
      }
    } else {
      selectedCollectionId = null;
    }

    // Render initial tag options for selected collection
    renderSelectableTags(selectedCollectionId, collections);

    // Bind Bookmark click
    btnBookmark.onclick = async () => {
      const title = document.getElementById("inp-title").value.trim();
      const description = document.getElementById("inp-description").value.trim();
      const collectionId = selectedCollectionId;

      // Fallback to active tab title if input title is empty
      const finalTitle = title || pageTitle || "Untitled Bookmark";

      btnBookmark.disabled = true;
      btnBookmark.innerHTML = `<div class="spinner" style="margin-bottom: 0; display: inline-block; vertical-align: middle; margin-right: 0.4rem;"></div> Saving...`;

      try {
        const createdPostId = await restAddBookmark(cachedOfflineData.projectId, cachedOfflineData.idToken, cachedOfflineData.uid, {
          title: finalTitle, description, link: pageUrl, collectionId, rating: selectedRating, tags: selectedTags
        });
        
        // Clear caches so the next check gets fresh database state
        cachedCollections = null;
        cachedPosts = null;
        await initPanel();
      } catch (err) {
        alert("Failed to save bookmark: " + err.message);
        btnBookmark.disabled = false;
        btnBookmark.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; margin-right: 0.45rem;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save Bookmark`;
      }
    };

    showState("state-form");
  }
}

// Helper to build nested collection options maintaining depth-first tree order without alphabetical sorting
function buildNestedCollectionOptions(collections) {
  const options = [
    { value: "", label: "Root level (no collection)", searchTitle: "Root level" }
  ];

  if (!collections || !Array.isArray(collections)) return options;

  const byParent = new Map();
  collections.forEach(col => {
    const parentId = col.parentId || "root";
    if (!byParent.has(parentId)) {
      byParent.set(parentId, []);
    }
    byParent.get(parentId).push(col);
  });

  function traverse(parentId, depth) {
    const children = byParent.get(parentId) || [];
    children.forEach(col => {
      const indent = "\u00A0\u00A0".repeat(depth) + (depth > 0 ? "↳ " : "");
      options.push({
        value: col.id,
        label: indent + col.title,
        searchTitle: col.title
      });
      traverse(col.id, depth + 1);
    });
  }

  traverse("root", 0);

  const visitedIds = new Set(options.map(o => o.value));
  collections.forEach(col => {
    if (!visitedIds.has(col.id)) {
      options.push({
        value: col.id,
        label: col.title,
        searchTitle: col.title
      });
    }
  });

  return options;
}

// Settings navigation state
let activeStateBeforeSettings = "state-loading";

// Main DOM entry
document.addEventListener("DOMContentLoaded", async () => {
  // Setup theme button state and listener
  let currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  
  function updateThemeUI(theme) {
    const btn = document.getElementById("btn-theme-toggle");
    if (btn) {
      if (theme === "dark") {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>`;
        btn.setAttribute("title", "Switch to Light Mode");
      } else {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3Z" /></svg>`;
        btn.setAttribute("title", "Switch to Dark Mode");
      }
    }
  }

  updateThemeUI(currentTheme);

  document.getElementById("btn-theme-toggle").onclick = async () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    await new Promise(resolve => {
      chrome.storage.local.set({ theme: currentTheme }, resolve);
    });
    updateThemeUI(currentTheme);
  };

  // Settings trigger
  document.getElementById("btn-settings-trigger").onclick = () => {
    const activeEl = document.querySelector(".state.active");
    if (activeEl && activeEl.id !== "state-settings") {
      activeStateBeforeSettings = activeEl.id;
    }
    showState("state-settings");
  };

  document.getElementById("btn-back-settings").onclick = () => {
    showState(activeStateBeforeSettings);
  };

  // Initialize custom select components
  collectionSelect = setupCustomSelect("select-collection", (val) => {
    selectedCollectionId = val || null;
    lastSelectedCollectionId = val || "";
    chrome.storage.local.set({ lastSelectedCollectionId: lastSelectedCollectionId });
  }, { hasSearch: true });
  
  viewStyleSelect = setupCustomSelect("select-view-style", async (val) => {
    await new Promise(resolve => {
      chrome.storage.local.set({ viewStyle: val }, resolve);
    });
  });

  // Load settings from storage and set values
  const config = await new Promise(resolve => {
    chrome.storage.local.get(["viewStyle", "autoFetchTitle"], resolve);
  });
  viewStyleSelect.setValue(config.viewStyle || "sidepanel");
  document.getElementById("chk-auto-fetch-title").checked = config.autoFetchTitle !== false;

  // Bind auto-fetch settings change
  document.getElementById("chk-auto-fetch-title").onchange = async (e) => {
    const isChecked = e.target.checked;
    await new Promise(resolve => {
      chrome.storage.local.set({ autoFetchTitle: isChecked }, resolve);
    });
    // If user is currently looking at the save form, reload it to reflect title change
    const activeEl = document.querySelector(".state.active");
    if (activeEl && activeEl.id === "state-form") {
      initPanel();
    }
  };

  // Bind logout click
  document.getElementById("btn-logout").onclick = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await new Promise(resolve => {
        chrome.storage.local.remove(["firebaseConfig", "refreshToken", "uid"], resolve);
      });
      cachedOfflineData = null;
      cachedCollections = null;
      cachedPosts = null;
      window.location.reload();
    }
  };

  // Run initial panel build after all custom selects and event bindings are set up
  initPanel();
});

// Global outside-click listener to close custom dropdowns
document.addEventListener("click", () => {
  document.querySelectorAll(".custom-select").forEach(el => el.classList.remove("active"));
});

// Custom Select Component Helper
function setupCustomSelect(containerId, onChange, { hasSearch = false } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  
  const trigger = container.querySelector(".custom-select__trigger");
  const optionsContainer = container.querySelector(".custom-select__options");
  const valueSpan = container.querySelector(".custom-select__value");
  
  let searchInput = null;

  if (hasSearch) {
    const searchWrapper = document.createElement("div");
    searchWrapper.className = "custom-select__search";
    searchWrapper.innerHTML = `
      <input type="text" class="custom-select__search-input" placeholder="Search collections..." tabindex="-1" />
    `;
    optionsContainer.prepend(searchWrapper);
    searchInput = searchWrapper.querySelector(".custom-select__search-input");

    searchInput.addEventListener("click", (e) => e.stopPropagation());
    searchInput.addEventListener("keydown", (e) => {
      e.stopPropagation();
    });
    searchInput.addEventListener("input", (e) => {
      filterOptions(e.target.value);
    });
  }

  function filterOptions(query) {
    const cleanQuery = query.trim().toLowerCase();
    const optionEls = optionsContainer.querySelectorAll(".custom-select__option");
    let matchCount = 0;

    optionEls.forEach(opt => {
      const searchTitle = (opt.getAttribute("data-search-title") || opt.textContent).toLowerCase();
      if (!cleanQuery || searchTitle.includes(cleanQuery)) {
        opt.style.display = "";
        matchCount++;
      } else {
        opt.style.display = "none";
      }
    });

    let noResultEl = optionsContainer.querySelector(".custom-select__no-results");
    if (matchCount === 0) {
      if (!noResultEl) {
        noResultEl = document.createElement("div");
        noResultEl.className = "custom-select__no-results";
        noResultEl.textContent = "No collections found";
        optionsContainer.appendChild(noResultEl);
      }
      noResultEl.style.display = "block";
    } else if (noResultEl) {
      noResultEl.style.display = "none";
    }
  }

  trigger.onclick = (e) => {
    e.stopPropagation();
    // Close other custom selects
    document.querySelectorAll(".custom-select").forEach(el => {
      if (el !== container) el.classList.remove("active");
    });
    const isActive = container.classList.toggle("active");
    if (isActive && searchInput) {
      searchInput.value = "";
      filterOptions("");
      setTimeout(() => searchInput.focus(), 50);
    }
  };
  
  function bindOptions() {
    container.querySelectorAll(".custom-select__option").forEach(opt => {
      opt.onclick = () => {
        const val = opt.getAttribute("data-value") || "";
        const label = opt.textContent.trim();
        
        valueSpan.textContent = label;
        
        container.querySelectorAll(".custom-select__option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        
        container.classList.remove("active");
        if (onChange) onChange(val);
      };
    });
  }
  
  bindOptions();
  
  return {
    setValue: (val) => {
      const opt = container.querySelector(`.custom-select__option[data-value="${val}"]`);
      if (opt) {
        valueSpan.textContent = opt.textContent.trim();
        container.querySelectorAll(".custom-select__option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
      }
    },
    updateOptions: (newOptions) => {
      const searchWrapper = optionsContainer.querySelector(".custom-select__search");
      optionsContainer.innerHTML = "";
      if (searchWrapper) {
        optionsContainer.appendChild(searchWrapper);
      }
      
      newOptions.forEach(opt => {
        const div = document.createElement("div");
        div.className = "custom-select__option";
        div.setAttribute("data-value", opt.value);
        div.setAttribute("data-search-title", opt.searchTitle || opt.label);
        div.textContent = opt.label;
        optionsContainer.appendChild(div);
      });
      bindOptions();
    }
  };
}

// Dynamic Tab Switching & Updating
chrome.tabs.onActivated.addListener(() => {
  initPanel();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    initPanel();
  }
});


