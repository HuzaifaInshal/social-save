"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionTree } from "@/components/collections/collection-tree";
import { DashboardModals, ModalState } from "@/components/dashboard/dashboard-modals";
import { SiteHeader } from "@/components/layout/site-header";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { SelectionState } from "@/types";

const emptySelection: SelectionState = { collectionIds: [], postIds: [] };

export function DashboardShell() {
  const { user, loading, isConfigured } = useAuth();
  const { collections, posts, tree } = useWorkspace(user?.uid);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState>(emptySelection);
  const [modal, setModal] = useState<ModalState | null>(null);

  const currentCollection = collections.find((item) => item.id === currentCollectionId) ?? null;
  const visibleCollections = useMemo(
    () => collections.filter((item) => item.parentId === currentCollectionId),
    [collections, currentCollectionId],
  );
  const visiblePosts = useMemo(
    () => posts.filter((item) => item.collectionId === currentCollectionId),
    [posts, currentCollectionId],
  );

  const resetModal = () => setModal(null);
  const resetSelection = () => setSelection(emptySelection);

  if (loading) {
    return <div className="dashboard-state">Loading workspace...</div>;
  }

  if (!isConfigured || !user) {
    return (
      <div className="shell">
        <SiteHeader />
        <main className="container auth-layout">
          <SignInPanel />
        </main>
      </div>
    );
  }

  const toggleSelected = (kind: keyof SelectionState, id: string) => {
    setSelection((current) => ({
      ...current,
      [kind]: current[kind].includes(id)
        ? current[kind].filter((value) => value !== id)
        : [...current[kind], id],
    }));
  };

  return (
    <div className="shell">
      <SiteHeader />
      <main className="container dashboard">
        <aside className="dashboard__sidebar card">
          <div className="dashboard__sidebarTop">
            <div>
              <span className="hero__eyebrow">Workspace</span>
              <h2>{user.displayName ?? "Your library"}</h2>
            </div>
            <Button onClick={() => setModal({ type: "createCollection", parentId: currentCollectionId })}>
              New collection
            </Button>
          </div>
          <CollectionTree
            nodes={tree}
            activeId={currentCollectionId}
            selectedIds={selection.collectionIds}
            onOpen={(id) => {
              setCurrentCollectionId(id);
              resetSelection();
            }}
            onToggleSelect={(id) => toggleSelected("collectionIds", id)}
          />
        </aside>

        <section className="dashboard__content">
          <div className="dashboard__hero card">
            <div>
              <span className="hero__eyebrow">{currentCollection ? "Collection" : "Root level"}</span>
              <h1>{currentCollection?.title ?? "All saved posts"}</h1>
              <p>{currentCollection?.description ?? "Build nested collections for every platform and topic."}</p>
            </div>
            <div className="dashboard__heroActions">
              <Button onClick={() => setModal({ type: "createPost", collectionId: currentCollectionId })}>
                Add post
              </Button>
              <Button variant="secondary" onClick={() => setModal({ type: "bulkUpload" })}>
                Bulk add
              </Button>
              {currentCollection ? (
                <>
                  <Button variant="ghost" onClick={() => setModal({ type: "editCollection", collection: currentCollection })}>
                    Edit collection
                  </Button>
                  <Button variant="ghost" onClick={() => setModal({ type: "moveCollections", collectionIds: [currentCollection.id] })}>
                    Move collection
                  </Button>
                  <Button variant="danger" onClick={() => setModal({ type: "deleteCollections", collectionIds: [currentCollection.id] })}>
                    Delete collection
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          <div className="dashboard__actions">
            <Button
              variant="secondary"
              disabled={!selection.collectionIds.length}
              onClick={() => setModal({ type: "moveCollections", collectionIds: selection.collectionIds })}
            >
              Move selected collections
            </Button>
            <Button
              variant="danger"
              disabled={!selection.collectionIds.length}
              onClick={() => setModal({ type: "deleteCollections", collectionIds: selection.collectionIds })}
            >
              Delete selected collections
            </Button>
            <Button
              variant="secondary"
              disabled={!selection.postIds.length}
              onClick={() => setModal({ type: "movePosts", postIds: selection.postIds })}
            >
              Move selected posts
            </Button>
            <Button
              variant="danger"
              disabled={!selection.postIds.length}
              onClick={() => setModal({ type: "deletePosts", postIds: selection.postIds })}
            >
              Delete selected posts
            </Button>
          </div>

          <section className="dashboard__section">
            <div className="section-heading">
              <h3>Child collections</h3>
              <span>{visibleCollections.length}</span>
            </div>
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
          </section>

          <section className="dashboard__section">
            <div className="section-heading">
              <h3>Posts</h3>
              <span>{visiblePosts.length}</span>
            </div>
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
          </section>
        </section>
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
          if (deletedIds.includes(currentCollectionId ?? "")) {
            setCurrentCollectionId(null);
          }
        }}
      />
    </div>
  );
}
