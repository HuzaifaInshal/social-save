"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionTree } from "@/components/collections/collection-tree";
import { DashboardModals, ModalState } from "@/components/dashboard/dashboard-modals";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import { SelectionState } from "@/types";

const emptySelection: SelectionState = { collectionIds: [], postIds: [] };
type DashboardTab = "info" | "collections" | "posts";
type ViewMode = "grid" | "list";

export function DashboardShell() {
  const { user, loading, isConfigured, signOut } = useAuth();
  const { showError } = useToast();
  const { collections, posts, tree } = useWorkspace(user?.uid);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState>(emptySelection);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("info");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Sign-out failed.");
    } finally {
      setSigningOut(false);
    }
  };

  const currentCollection = collections.find((c) => c.id === currentCollectionId) ?? null;
  const visibleCollections = useMemo(
    () => collections.filter((c) => c.parentId === currentCollectionId),
    [collections, currentCollectionId],
  );
  const visiblePosts = useMemo(
    () => posts.filter((p) => p.collectionId === currentCollectionId),
    [posts, currentCollectionId],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCollections = useMemo(() => {
    if (!normalizedQuery) return visibleCollections;
    return visibleCollections.filter((collection) =>
      `${collection.title} ${collection.description}`.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, visibleCollections]);
  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) return visiblePosts;
    return visiblePosts.filter((post) =>
      `${post.title} ${post.description} ${post.link} ${post.platform}`.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, visiblePosts]);

  const resetModal = () => setModal(null);
  const resetSelection = () => setSelection(emptySelection);
  const openCollection = (id: string | null) => {
    setCurrentCollectionId(id);
    setActiveTab("info");
    resetSelection();
  };

  const toggleSelected = (kind: keyof SelectionState, id: string) => {
    setSelection((s) => ({
      ...s,
      [kind]: s[kind].includes(id) ? s[kind].filter((v) => v !== id) : [...s[kind], id],
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 20, height: 20 }} />
        Loading workspace…
      </div>
    );
  }

  if (!isConfigured || !user) {
    return <SignInPanel />;
  }

  const userInitial = (user.displayName ?? user.email ?? "U")[0].toUpperCase();
  const userName = user.displayName ?? user.email ?? "My workspace";
  const pageTitle = currentCollection?.title ?? "All saved posts";
  const pageDescription = currentCollection?.description ?? "Your complete library of saved social content.";

  const hasCollectionSelection = selection.collectionIds.length > 0;
  const hasPostSelection = selection.postIds.length > 0;
  const hasSelection = hasCollectionSelection || hasPostSelection;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__brand-icon">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 3.5A1.5 1.5 0 0 1 6.5 2h7A1.5 1.5 0 0 1 15 3.5v13.1a.7.7 0 0 1-1.08.59L10 14.68l-3.92 2.51A.7.7 0 0 1 5 16.6V3.5Z" />
              </svg>
            </span>
            Social Save
          </div>
        </div>

        <div className="sidebar__create">
          <Button
            className="sidebar__create-button"
            onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}
          >
            <span aria-hidden="true">+</span> New Collection
          </Button>
        </div>

        <div className="sidebar__nav">
          <div className="sidebar__section-label">Collections</div>
          <CollectionTree
            nodes={tree}
            activeId={currentCollectionId}
            selectedIds={selection.collectionIds}
            onOpen={openCollection}
            onToggleSelect={(id) => toggleSelected("collectionIds", id)}
          />
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">{userInitial}</div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{userName}</div>
              <div className="sidebar__user-email">{user.email}</div>
            </div>
            <span className="sidebar__user-chevron" aria-hidden="true">⌄</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <div className="dashboard-search">
            <span className="dashboard-search__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg>
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts and collections..."
              aria-label="Search"
            />
          </div>
          <div className="dashboard-topbar__actions">
            <ThemeToggle />
            <button className="icon-button" aria-label="Notifications" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </button>
            <Button variant="ghost" onClick={() => void handleSignOut()} disabled={signingOut} style={{ fontSize: "0.85rem" }}>
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Bulk action bar */}
          {hasSelection && (
            <div className="bulk-bar">
              <span className="bulk-bar__label">
                {selection.collectionIds.length + selection.postIds.length} selected
              </span>
              {hasCollectionSelection && (
                <>
                  <Button variant="secondary" onClick={() => setModal({ type: "moveCollections", collectionIds: selection.collectionIds })}>
                    Move collections
                  </Button>
                  <Button variant="danger" onClick={() => setModal({ type: "deleteCollections", collectionIds: selection.collectionIds })}>
                    Delete collections
                  </Button>
                </>
              )}
              {hasPostSelection && (
                <>
                  <Button variant="secondary" onClick={() => setModal({ type: "movePosts", postIds: selection.postIds })}>
                    Move posts
                  </Button>
                  <Button variant="danger" onClick={() => setModal({ type: "deletePosts", postIds: selection.postIds })}>
                    Delete posts
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={resetSelection}>Clear</Button>
            </div>
          )}

          <div className="dashboard-tabs-row">
            <div className="dashboard-tabs" role="tablist" aria-label="Workspace view">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "info"}
                className={activeTab === "info" ? "dashboard-tab dashboard-tab--active" : "dashboard-tab"}
                onClick={() => setActiveTab("info")}
              >
                Info
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "collections"}
                className={activeTab === "collections" ? "dashboard-tab dashboard-tab--active" : "dashboard-tab"}
                onClick={() => setActiveTab("collections")}
              >
                Collections
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "posts"}
                className={activeTab === "posts" ? "dashboard-tab dashboard-tab--active" : "dashboard-tab"}
                onClick={() => setActiveTab("posts")}
              >
                Posts
              </button>
            </div>
            <div className="dashboard-view-actions">
              <button className="sort-button" type="button">Sort by <strong>Newest</strong><span aria-hidden="true">⌄</span></button>
              <button
                className={cn("view-button", viewMode === "grid" && "view-button--active")}
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
              >
                ▦
              </button>
              <button
                className={cn("view-button", viewMode === "list" && "view-button--active")}
                type="button"
                aria-label="List view"
                onClick={() => setViewMode("list")}
              >
                ☷
              </button>
            </div>
          </div>

          {/* Info section */}
          {activeTab === "info" && <div className="dashboard-page-header">
            <div className="dashboard-page-header__left">
              <div className="dashboard-title-row">
                <h1>{pageTitle}</h1>
                <span className="dashboard-title-pill">{visiblePosts.length} posts</span>
              </div>
              <p>{pageDescription}</p>
              <div className="dashboard-stats">
                <div className="stat-chip">
                  <span className="stat-chip__icon" aria-hidden="true">📁</span>
                  <strong>{collections.length}</strong>
                  <span>Collections</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip__icon" aria-hidden="true">▣</span>
                  <strong>{posts.length}</strong>
                  <span>Total Posts</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip__icon" aria-hidden="true">▱</span>
                  <strong>{visiblePosts.length}</strong>
                  <span>Posts Here</span>
                </div>
              </div>
            </div>
            <div className="dashboard-profile-orb" aria-hidden="true">
              <div className="dashboard-profile-orb__inner">{pageTitle[0]?.toUpperCase() ?? "S"}</div>
            </div>
            {currentCollection && (
              <div className="dashboard-page-header__actions">
                <button className="icon-button" onClick={() => setModal({ type: "editCollection", collection: currentCollection })} aria-label="Edit collection">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
                </button>
                <button className="icon-button" onClick={() => setModal({ type: "moveCollections", collectionIds: [currentCollection.id] })} aria-label="Move collection">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9V5h4" /><path d="m5 5 6 6" /><path d="M19 15v4h-4" /><path d="m19 19-6-6" /></svg>
                </button>
                <button className="icon-button icon-button--danger" onClick={() => setModal({ type: "deleteCollections", collectionIds: [currentCollection.id] })} aria-label="Delete collection">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></svg>
                </button>
              </div>
            )}
          </div>}

          {/* Collections section */}
          {activeTab === "collections" && <div className="dashboard-section">
            <div className="section-header">
              <h2>Collections</h2>
              <span className="section-header__count">{filteredCollections.length}</span>
            </div>
            {filteredCollections.length > 0 ? (
              <div className="collection-grid">
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    checked={selection.collectionIds.includes(collection.id)}
                    onOpen={openCollection}
                    onToggleSelect={(id) => toggleSelected("collectionIds", id)}
                    onEdit={(item) => setModal({ type: "editCollection", collection: item })}
                    onDelete={(item) => setModal({ type: "deleteCollections", collectionIds: [item.id] })}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>
                </span>
                <p>No collections here yet.</p>
                <Button variant="secondary" onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}>
                  Create Collection
                </Button>
              </div>
            )}
          </div>}

          {/* Posts section */}
          {activeTab === "posts" && <div className="dashboard-section">
            <div className="posts-header-row">
              <div className="section-header section-header--posts">
                <h2>Posts <span>({filteredPosts.length})</span></h2>
              </div>
              <div className="posts-tools">
                <Button variant="secondary" onClick={() => setModal({ type: "bulkUpload" })}>
                  Bulk add
                </Button>
                <Button onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}>
                  + Add post
                </Button>
                <div className="post-filter">
                  <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg></span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter posts..." aria-label="Filter posts" />
                  <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" /></svg></span>
                </div>
              </div>
            </div>
            {filteredPosts.length > 0 ? (
              <div className={viewMode === "grid" ? "post-grid" : "post-list"}>
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    checked={selection.postIds.includes(post.id)}
                    onToggleSelect={(id) => toggleSelected("postIds", id)}
                    onEdit={(item) => setModal({ type: "editPost", post: item })}
                    onDelete={(item) => setModal({ type: "deletePosts", postIds: [item.id] })}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state__icon">🔗</span>
                <p>No posts saved here yet.</p>
                <Button variant="secondary" onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}>
                  Add first post
                </Button>
              </div>
            )}
          </div>}
        </div>
      </main>

      <DashboardModals
        modal={modal}
        collections={collections}
        posts={posts}
        currentCollectionId={currentCollectionId}
        ownerId={user.uid}
        onClose={resetModal}
        onResetSelection={resetSelection}
        onCurrentCollectionRemoved={(deletedIds) => {
          if (deletedIds.includes(currentCollectionId ?? "")) setCurrentCollectionId(null);
        }}
      />
    </div>
  );
}
