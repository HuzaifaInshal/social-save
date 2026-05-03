"use client";

import {
  bulkCreateLinks,
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
import { SelectInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
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
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);

  if (!modal) return null;

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitCollection = (values: CollectionFormValues, collectionId?: string) =>
    run(async () => {
      if (collectionId) await updateCollection(collectionId, values);
      else await createCollection(ownerId, values);
      onClose();
    });

  const submitPost = (values: PostFormValues, postId?: string) =>
    run(async () => {
      if (postId) await updatePost(postId, values);
      else await createPost(ownerId, values);
      onClose();
    });

  if (modal.type === "createCollection") {
    return (
      <CollectionFormModal
        title="Create collection"
        collections={collections}
        initialValues={{ title: "", description: "", parentId: modal.parentId }}
        loading={loading}
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
        loading={loading}
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
        loading={loading}
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
        loading={loading}
        onClose={onClose}
        onSubmit={(values) => submitPost(values, modal.post.id)}
      />
    );
  }

  if (modal.type === "bulkUpload") {
    return (
      <BulkUploadModal
        loading={loading}
        onClose={onClose}
        onSubmitLinks={(value) =>
          run(async () => {
            await bulkCreateLinks(ownerId, currentCollectionId, value);
            onClose();
          })
        }
        onSubmitPosts={(value) =>
          run(async () => {
            await bulkCreatePosts(ownerId, currentCollectionId, value);
            onClose();
          })
        }
      />
    );
  }

  if (modal.type === "movePosts") {
    return (
      <MoveModal
        title="Move posts"
        label="Choose destination"
        collections={collections}
        loading={loading}
        onClose={onClose}
        onSubmit={(targetId) =>
          run(async () => {
            await movePosts(modal.postIds, targetId);
            onClose();
            onResetSelection();
          })
        }
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
        loading={loading}
        onClose={onClose}
        onSubmit={(targetId) =>
          run(async () => {
            await moveCollections(modal.collectionIds, targetId, collections);
            onClose();
            onResetSelection();
          })
        }
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
        loading={loading}
        onCancel={onClose}
        onConfirm={() =>
          run(async () => {
            await deletePosts(modal.postIds);
            onClose();
            onResetSelection();
          })
        }
      />
    );
  }

  return (
    <DeleteCollectionsFlow
      collections={collections}
      posts={posts}
      collectionIds={modal.collectionIds}
      loading={loading}
      onClose={onClose}
      onConfirm={(movePostsToId) =>
        run(async () => {
          const targetId = movePostsToId === "root" ? null : movePostsToId;
          await deleteCollections(
            modal.collectionIds,
            collections,
            posts,
            movePostsToId === "delete" ? undefined : targetId,
          );
          onClose();
          onResetSelection();
          onCurrentCollectionRemoved(modal.collectionIds);
        })
      }
    />
  );
}

function DeleteCollectionsFlow({
  collections,
  collectionIds,
  loading,
  onClose,
  onConfirm,
}: {
  collections: CollectionItem[];
  posts: PostItem[];
  collectionIds: string[];
  loading: boolean;
  onClose: () => void;
  onConfirm: (movePostsToId: string) => void;
}) {
  const [movePostsToId, setMovePostsToId] = useState("delete");

  return (
    <ConfirmationModal
      title="Delete collections?"
      description="Deleting a collection also affects all nested collections. You can move the contained posts first or delete everything together."
      confirmLabel="Delete collections"
      confirmVariant="danger"
      loading={loading}
      onCancel={onClose}
      onConfirm={() => onConfirm(movePostsToId)}
      extra={
        <label className="field">
          <span className="field__label">Move posts before deleting</span>
          <SelectInput
            value={movePostsToId}
            onValueChange={setMovePostsToId}
            options={[
              { value: "delete", label: "Delete posts with collections" },
              { value: "root", label: "Move posts to root level" },
              ...collections
                .filter((c) => !collectionIds.includes(c.id))
                .map((c) => ({ value: c.id, label: c.title })),
            ]}
          />
        </label>
      }
    />
  );
}
