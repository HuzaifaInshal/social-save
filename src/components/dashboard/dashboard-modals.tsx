"use client";

import {
  bulkCreatePosts,
  createCollection,
  createPost,
  deleteCollections,
  deletePosts,
  moveCollections,
  movePosts,
  updateCollection,
  updatePost,
} from "@/lib/firebase/firestore";
import { CollectionFormValues, CollectionItem, PostFormValues, PostItem } from "@/types";
import { CollectionFormModal } from "@/components/collections/collection-form-modal";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { MoveModal } from "@/components/modals/move-modal";
import { BulkUploadModal } from "@/components/posts/bulk-upload-modal";
import { PostFormModal } from "@/components/posts/post-form-modal";
import { useState } from "react";

export type ModalState =
  | { type: "createCollection"; parentId: string | null }
  | { type: "editCollection"; collection: CollectionItem }
  | { type: "deleteCollections"; collectionIds: string[] }
  | { type: "moveCollections"; collectionIds: string[] }
  | { type: "createPost"; collectionId: string | null }
  | { type: "editPost"; post: PostItem }
  | { type: "bulkUpload" }
  | { type: "deletePosts"; postIds: string[] }
  | { type: "movePosts"; postIds: string[] };

type DashboardModalsProps = {
  modal: ModalState | null;
  collections: CollectionItem[];
  posts: PostItem[];
  currentCollectionId: string | null;
  ownerId: string;
  onClose: () => void;
  onResetSelection: () => void;
  onCurrentCollectionRemoved: (deletedIds: string[]) => void;
};

export function DashboardModals({
  modal,
  collections,
  posts,
  currentCollectionId,
  ownerId,
  onClose,
  onResetSelection,
  onCurrentCollectionRemoved,
}: DashboardModalsProps) {
  if (!modal) return null;

  const submitCollection = async (values: CollectionFormValues, collectionId?: string) => {
    if (collectionId) await updateCollection(collectionId, values);
    else await createCollection(ownerId, values);
    onClose();
  };

  const submitPost = async (values: PostFormValues, postId?: string) => {
    if (postId) await updatePost(postId, values);
    else await createPost(ownerId, values);
    onClose();
  };

  if (modal.type === "createCollection") {
    return (
      <CollectionFormModal
        title="Create collection"
        collections={collections}
        initialValues={{ title: "", description: "", parentId: modal.parentId }}
        onClose={onClose}
        onSubmit={(values) => submitCollection(values)}
      />
    );
  }

  if (modal.type === "editCollection") {
    return (
      <CollectionFormModal
        title="Edit collection"
        collections={collections}
        excludedIds={[modal.collection.id]}
        initialValues={modal.collection}
        onClose={onClose}
        onSubmit={(values) => submitCollection(values, modal.collection.id)}
      />
    );
  }

  if (modal.type === "createPost") {
    return (
      <PostFormModal
        title="Add post"
        collections={collections}
        initialValues={{ title: "", description: "", link: "", collectionId: modal.collectionId }}
        onClose={onClose}
        onSubmit={(values) => submitPost(values)}
      />
    );
  }

  if (modal.type === "editPost") {
    return (
      <PostFormModal
        title="Edit post"
        collections={collections}
        initialValues={modal.post}
        onClose={onClose}
        onSubmit={(values) => submitPost(values, modal.post.id)}
      />
    );
  }

  if (modal.type === "bulkUpload") {
    return (
      <BulkUploadModal
        onClose={onClose}
        onSubmit={async (value) => {
          await bulkCreatePosts(ownerId, currentCollectionId, value);
          onClose();
        }}
      />
    );
  }

  if (modal.type === "movePosts") {
    return (
      <MoveModal
        title="Move posts"
        label="Choose destination"
        collections={collections}
        onClose={onClose}
        onSubmit={async (targetId) => {
          await movePosts(modal.postIds, targetId);
          onClose();
          onResetSelection();
        }}
      />
    );
  }

  if (modal.type === "moveCollections") {
    return (
      <MoveModal
        title="Move collections"
        label="Choose new parent"
        collections={collections}
        excludedIds={modal.collectionIds}
        onClose={onClose}
        onSubmit={async (targetId) => {
          await moveCollections(modal.collectionIds, targetId, collections);
          onClose();
          onResetSelection();
        }}
      />
    );
  }

  if (modal.type === "deletePosts") {
    return (
      <ConfirmationModal
        title="Delete posts?"
        description="This action permanently removes the selected posts."
        confirmLabel="Delete posts"
        confirmVariant="danger"
        onCancel={onClose}
        onConfirm={() => {
          void deletePosts(modal.postIds).then(() => {
            onClose();
            onResetSelection();
          });
        }}
      />
    );
  }

  return (
    <DeleteCollectionsFlow
      collections={collections}
      posts={posts}
      collectionIds={modal.collectionIds}
      onClose={onClose}
      onDone={() => {
        onClose();
        onResetSelection();
        onCurrentCollectionRemoved(modal.collectionIds);
      }}
    />
  );
}

function DeleteCollectionsFlow({
  collections,
  posts,
  collectionIds,
  onClose,
  onDone,
}: {
  collections: CollectionItem[];
  posts: PostItem[];
  collectionIds: string[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [movePostsToId, setMovePostsToId] = useState("delete");

  return (
    <ConfirmationModal
      title="Delete collections?"
      description="Deleting a collection also affects all nested collections. You can move the contained posts first or delete everything together."
      confirmLabel="Delete collections"
      confirmVariant="danger"
      onCancel={onClose}
      onConfirm={() => {
        const targetId = movePostsToId === "root" ? null : movePostsToId;
        void deleteCollections(collectionIds, collections, posts, movePostsToId === "delete" ? undefined : targetId).then(onDone);
      }}
      extra={
        <label className="field">
          <span className="field__label">Move posts before deleting</span>
          <select value={movePostsToId} onChange={(event) => setMovePostsToId(event.target.value)} className="field__control">
            <option value="delete">Delete posts with collections</option>
            <option value="root">Move posts to root level</option>
            {collections
              .filter((collection) => !collectionIds.includes(collection.id))
              .map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.title}
                </option>
              ))}
          </select>
        </label>
      }
    />
  );
}
