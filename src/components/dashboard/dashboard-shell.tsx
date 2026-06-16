"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionTree } from "@/components/collections/collection-tree";
import { DashboardModals, ModalState } from "@/components/dashboard/dashboard-modals";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PostCard } from "@/components/posts/post-card";
import { PostReader } from "@/components/posts/post-reader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/hooks/use-workspace";
import { SelectionState } from "@/types";

const emptySelection: SelectionState = { collectionIds: [], postIds: [] };

type ContentTab = "collections" | "posts";
type PostsView = "grid" | "reader";

export function DashboardShell() {
  const { user, loading, isConfigured, signOut } = useAuth();
  const { showError } = useToast();
  const { collections, posts, tree } = useWorkspace(user?.uid);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState>(emptySelection);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentTab>("collections");
  const [postsView, setPostsView] = useState<PostsView>("grid");
  const [postFilter, setPostFilter] = useState("");

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
  const filteredPosts = useMemo(
    () => postFilter
      ? visiblePosts.filter((p) => p.title.toLowerCase().includes(postFilter.toLowerCase()) || p.link.toLowerCase().includes(postFilter.toLowerCase()))
      : visiblePosts,
    [visiblePosts, postFilter],
  );

  const resetModal = () => setModal(null);
  const resetSelection = () => setSelection(emptySelection);

  const handleOpenCollection = (id: string | null) => {
    setCurrentCollectionId(id);
    resetSelection();
    setActiveTab("collections");
    setPostsView("grid");
    setPostFilter("");
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

  const hasCollectionSelection = selection.collectionIds.length > 0;
  const hasPostSelection = selection.postIds.length > 0;
  const hasSelection = hasCollectionSelection || hasPostSelection;

  const isInsideCollection = currentCollection !== null;

  return (
    <div className="dashboard-layout">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__brand-icon">
              <svg viewBox="0 0 16 16" fill="white" width="14" height="14">
                <path d="M3 1.5A1.5 1.5 0 014.5 0h7A1.5 1.5 0 0113 1.5v12.232a.75.75 0 01-1.152.634L8 11.902l-3.848 2.464A.75.75 0 013 13.732V1.5z" />
              </svg>
            </span>
            Social Save
          </div>
        </div>

        {/* New Collection Button */}
        <div className="sidebar__new-btn-wrap">
          <button
            className="sidebar__new-btn"
            onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Collection
          </button>
        </div>

        <div className="sidebar__nav">
          <div className="sidebar__section-label">Collections</div>
          <CollectionTree
            nodes={tree}
            activeId={currentCollectionId}
            selectedIds={selection.collectionIds}
            onOpen={(id) => handleOpenCollection(id)}
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
            {/* Chevron */}
            <svg className="sidebar__user-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <div className="dashboard-search">
            <svg className="dashboard-search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input placeholder="Search posts and collections..." aria-label="Search" />
          </div>
          <div className="dashboard-topbar__actions">
            <ThemeToggle />
            {/* Notification bell */}
            <button className="topbar-icon-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M4 6a4 4 0 018 0c0 2.667 1.333 4 2 4.667.167.166.25.333.25.5 0 .5-.5.833-1.5.833H3.25c-1 0-1.5-.333-1.5-.833 0-.167.083-.334.25-.5C2.667 10 4 8.667 4 6z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
            <Button variant="ghost" onClick={() => void handleSignOut()} disabled={signingOut} style={{ fontSize: "0.85rem" }}>
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* ─── Collection Hero Header ─── */}
          {isInsideCollection ? (
            <>
              <div className="hero-card">
                <div className="hero-card__content">
                  <div className="hero-card__left">
                    <div className="hero-card__title-row">
                      <h1 className="hero-card__title">{currentCollection.title}</h1>
                      <span className="hero-card__badge">{visiblePosts.length} posts</span>
                    </div>
                    <p className="hero-card__desc">
                      {currentCollection.description || "No description yet."}
                    </p>
                  </div>
                  <div className="hero-card__right">
                    <div className="hero-card__avatar">
                      {userInitial}
                    </div>
                  </div>
                  <button
                    className="hero-card__edit-btn"
                    onClick={() => setModal({ type: "editCollection", collection: currentCollection })}
                    title="Edit collection"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Stats row */}
                <div className="hero-stats">
                  <div className="hero-stat">
                    <span className="hero-stat__icon hero-stat__icon--collections">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 3.5A1.5 1.5 0 013.5 2h3.379a1.5 1.5 0 011.06.44L8.56 3.06A.5.5 0 008.914 3.25H12.5A1.5 1.5 0 0114 4.75v7.75a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9z" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </span>
                    <div className="hero-stat__text">
                      <span className="hero-stat__number">{visibleCollections.length}</span>
                      <span className="hero-stat__label">Collections</span>
                    </div>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat__icon hero-stat__icon--posts">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M5 6h6M5 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <div className="hero-stat__text">
                      <span className="hero-stat__number">{posts.length}</span>
                      <span className="hero-stat__label">Total Posts</span>
                    </div>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat__icon hero-stat__icon--here">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 2.5A1.5 1.5 0 014.5 1h7A1.5 1.5 0 0113 2.5v11.232a.5.5 0 01-.768.422L8 11.502l-4.232 2.652A.5.5 0 013 13.732V2.5z" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </span>
                    <div className="hero-stat__text">
                      <span className="hero-stat__number">{visiblePosts.length}</span>
                      <span className="hero-stat__label">Posts Here</span>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* ─── Underline Tabs + View Controls ─── */}
              <div className="content-tabs-bar">
                <div className="content-tabs">
                  <button
                    className={`content-tabs__tab ${activeTab === "collections" ? "content-tabs__tab--active" : ""}`}
                    onClick={() => setActiveTab("collections")}
                  >
                    Collections
                  </button>
                  <button
                    className={`content-tabs__tab ${activeTab === "posts" ? "content-tabs__tab--active" : ""}`}
                    onClick={() => setActiveTab("posts")}
                  >
                    Posts
                  </button>
                </div>
                <div className="content-tabs-bar__right">
                  <div className="view-toggle">
                    <button
                      className={`view-toggle__btn ${postsView === "grid" ? "view-toggle__btn--active" : ""}`}
                      onClick={() => setPostsView("grid")}
                      aria-label="Grid view"
                      title="Grid view"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </button>
                    <button
                      className={`view-toggle__btn ${postsView === "reader" ? "view-toggle__btn--active" : ""}`}
                      onClick={() => setPostsView("reader")}
                      aria-label="Reader view"
                      title="Reader view"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 3.5h12M2 6.5h12M2 9.5h12M2 12.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content: Collections */}
              {activeTab === "collections" && (
                <div className="tab-content-box">
                  {visibleCollections.length > 0 ? (
                    <div className="collection-grid">
                      {visibleCollections.map((collection) => (
                        <CollectionCard
                          key={collection.id}
                          collection={collection}
                          checked={selection.collectionIds.includes(collection.id)}
                          onOpen={handleOpenCollection}
                          onToggleSelect={(id) => toggleSelected("collectionIds", id)}
                          onEdit={(item) => setModal({ type: "editCollection", collection: item })}
                          onDelete={(item) => setModal({ type: "deleteCollections", collectionIds: [item.id] })}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <svg className="empty-state__svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <rect x="8" y="14" width="40" height="30" rx="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 14l8-8h12l4 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                      <p>No collections here yet.</p>
                      <button
                        className="empty-state__btn"
                        onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}
                      >
                        Create Collection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Posts */}
              {activeTab === "posts" && (
                <div className="tab-content-box">
                  {postsView === "grid" ? (
                    visiblePosts.length > 0 ? (
                      <div className="post-grid">
                        {visiblePosts.map((post) => (
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
                        <svg className="empty-state__svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                          <path d="M16 8A4 4 0 0120 4h16a4 4 0 014 4v38a2 2 0 01-3.072 1.688L28 40.002l-8.928 5.686A2 2 0 0116 44V8z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <p>No posts saved here yet.</p>
                        <button
                          className="empty-state__btn"
                          onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}
                        >
                          Add First Post
                        </button>
                      </div>
                    )
                  ) : (
                    <PostReader posts={visiblePosts} />
                  )}
                </div>
              )}

              {/* ─── Posts Section (always visible below tabs) ─── */}
              <div className="posts-section">
                <div className="posts-section__header">
                  <h2 className="posts-section__title">Posts <span className="posts-section__count">({visiblePosts.length})</span></h2>
                  <div className="posts-section__controls">
                    <div className="posts-section__filter">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      <input
                        placeholder="Filter posts..."
                        value={postFilter}
                        onChange={(e) => setPostFilter(e.target.value)}
                        aria-label="Filter posts"
                      />
                    </div>
                    <button className="topbar-icon-btn" title="Filter options">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                {filteredPosts.length > 0 ? (
                  <div className="post-grid">
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
                  <div className="empty-state empty-state--compact">
                    <p>{postFilter ? "No posts match your filter." : "No posts saved here yet."}</p>
                    {!postFilter && (
                      <button
                        className="empty-state__btn"
                        onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}
                      >
                        Add First Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ─── Root view (no collection selected) ─── */
            <>
              <div className="dashboard-page-header">
                <div className="dashboard-page-header__left">
                  <h1>All saved posts</h1>
                  <p>Your complete library of saved social content.</p>
                </div>
              </div>

              {/* Stats */}
              <div className="dashboard-stats">
                <div className="stat-chip"><strong>{collections.length}</strong> collections</div>
                <div className="stat-chip"><strong>{posts.length}</strong> total posts</div>
                <div className="stat-chip"><strong>{visiblePosts.length}</strong> here</div>
              </div>

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

              {/* Collections */}
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Collections</h2>
                  <span className="section-header__count">{visibleCollections.length}</span>
                </div>
                {visibleCollections.length > 0 ? (
                  <div className="collection-grid">
                    {visibleCollections.map((collection) => (
                      <CollectionCard
                        key={collection.id}
                        collection={collection}
                        checked={selection.collectionIds.includes(collection.id)}
                        onOpen={handleOpenCollection}
                        onToggleSelect={(id) => toggleSelected("collectionIds", id)}
                        onEdit={(item) => setModal({ type: "editCollection", collection: item })}
                        onDelete={(item) => setModal({ type: "deleteCollections", collectionIds: [item.id] })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg className="empty-state__svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <rect x="8" y="14" width="40" height="30" rx="4" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 14l8-8h12l4 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                    <p>No collections here yet.</p>
                    <button
                      className="empty-state__btn"
                      onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}
                    >
                      Create collection
                    </button>
                  </div>
                )}
              </div>

              {/* Posts */}
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Posts</h2>
                  <span className="section-header__count">{visiblePosts.length}</span>
                </div>
                {visiblePosts.length > 0 ? (
                  <div className="post-grid">
                    {visiblePosts.map((post) => (
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
                    <svg className="empty-state__svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <path d="M16 8A4 4 0 0120 4h16a4 4 0 014 4v38a2 2 0 01-3.072 1.688L28 40.002l-8.928 5.686A2 2 0 0116 44V8z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <p>No posts saved here yet.</p>
                    <button
                      className="empty-state__btn"
                      onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}
                    >
                      Add first post
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
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
