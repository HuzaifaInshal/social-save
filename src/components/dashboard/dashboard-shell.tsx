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
import { SelectionState } from "@/types";

const emptySelection: SelectionState = { collectionIds: [], postIds: [] };

export function DashboardShell() {
  const { user, loading, isConfigured, signOut } = useAuth();
  const { showError } = useToast();
  const { collections, posts, tree } = useWorkspace(user?.uid);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState>(emptySelection);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [signingOut, setSigningOut] = useState(false);

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

  const resetModal = () => setModal(null);
  const resetSelection = () => setSelection(emptySelection);

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

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__brand-icon">
              <svg viewBox="0 0 16 16" fill="white" width="14" height="14">
                <path d="M2 3h5v5H2zM9 3h5v5H9zM2 10h5v3H2zM9 10h5v3H9z" />
              </svg>
            </span>
            Social Save
          </div>
          <Button
            variant="ghost"
            style={{ padding: "0.35rem 0.6rem", fontSize: "1.1rem", lineHeight: 1 }}
            onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}
            title="New collection"
          >
            +
          </Button>
        </div>

        <div className="sidebar__nav">
          <div className="sidebar__section-label">Collections</div>
          <CollectionTree
            nodes={tree}
            activeId={currentCollectionId}
            selectedIds={selection.collectionIds}
            onOpen={(id) => { setCurrentCollectionId(id); resetSelection(); }}
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
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <div className="dashboard-search">
            <span className="dashboard-search__icon">⌕</span>
            <input placeholder="Search posts and collections…" aria-label="Search" />
          </div>
          <div className="dashboard-topbar__actions">
            <Button onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}>
              + Add post
            </Button>
            <Button variant="secondary" onClick={() => setModal({ type: "bulkUpload" })}>
              Bulk add
            </Button>
            <ThemeToggle />
            <Button variant="ghost" onClick={() => void handleSignOut()} disabled={signingOut} style={{ fontSize: "0.85rem" }}>
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Page header */}
          <div className="dashboard-page-header">
            <div className="dashboard-page-header__left">
              <h1>{currentCollection?.title ?? "All saved posts"}</h1>
              <p>{currentCollection?.description ?? "Your complete library of saved social content."}</p>
            </div>
            {currentCollection && (
              <div className="dashboard-page-header__actions">
                <Button variant="ghost" onClick={() => setModal({ type: "editCollection", collection: currentCollection })}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => setModal({ type: "moveCollections", collectionIds: [currentCollection.id] })}>
                  Move
                </Button>
                <Button variant="danger" onClick={() => setModal({ type: "deleteCollections", collectionIds: [currentCollection.id] })}>
                  Delete
                </Button>
              </div>
            )}
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

          {/* Collections section */}
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
                    onOpen={setCurrentCollectionId}
                    onToggleSelect={(id) => toggleSelected("collectionIds", id)}
                    onEdit={(item) => setModal({ type: "editCollection", collection: item })}
                    onDelete={(item) => setModal({ type: "deleteCollections", collectionIds: [item.id] })}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state__icon">📁</span>
                <p>No collections here yet.</p>
                <Button variant="secondary" onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}>
                  Create collection
                </Button>
              </div>
            )}
          </div>

          {/* Posts section */}
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
                <span className="empty-state__icon">🔗</span>
                <p>No posts saved here yet.</p>
                <Button variant="secondary" onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}>
                  Add first post
                </Button>
              </div>
            )}
          </div>
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
