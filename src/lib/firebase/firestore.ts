import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";
import { getDescendantCollectionIds, getPlatformFromLink, isInvalidCollectionMove } from "@/lib/utils";
import { CollectionItem, CollectionFormValues, PostFormValues, PostItem } from "@/types";

const COLLECTIONS = "collections";
const POSTS = "posts";

function withTimestamps<T extends object>(values: T) {
  return {
    ...values,
    updatedAt: Date.now(),
  };
}

export function subscribeToCollections(ownerId: string, callback: (items: CollectionItem[]) => void) {
  const q = query(collection(getFirebaseDb(), COLLECTIONS), where("ownerId", "==", ownerId), orderBy("title"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as CollectionItem));
  });
}

export function subscribeToPosts(ownerId: string, callback: (items: PostItem[]) => void) {
  const q = query(collection(getFirebaseDb(), POSTS), where("ownerId", "==", ownerId), orderBy("title"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as PostItem));
  });
}

export async function createCollection(ownerId: string, values: CollectionFormValues) {
  return addDoc(collection(getFirebaseDb(), COLLECTIONS), {
    ownerId,
    title: values.title,
    description: values.description,
    parentId: values.parentId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdMarker: serverTimestamp(),
  });
}

export async function updateCollection(collectionId: string, values: CollectionFormValues) {
  return updateDoc(doc(getFirebaseDb(), COLLECTIONS, collectionId), withTimestamps(values));
}

export async function createPost(ownerId: string, values: PostFormValues) {
  return addDoc(collection(getFirebaseDb(), POSTS), {
    ownerId,
    collectionId: values.collectionId,
    title: values.title,
    description: values.description,
    link: values.link,
    platform: getPlatformFromLink(values.link),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdMarker: serverTimestamp(),
  });
}

export async function updatePost(postId: string, values: PostFormValues) {
  return updateDoc(
    doc(getFirebaseDb(), POSTS, postId),
    withTimestamps({
      ...values,
      platform: getPlatformFromLink(values.link),
    }),
  );
}

export async function bulkCreatePosts(ownerId: string, collectionId: string | null, rawText: string) {
  const lines = rawText.split("\n").map((line) => line.trim()).filter(Boolean);
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  lines.forEach((line) => {
    const [title, description, link] = line.split("|").map((part) => part.trim());
    const ref = doc(collection(db, POSTS));
    batch.set(ref, {
      ownerId,
      collectionId,
      title: title || "Untitled post",
      description: description || "",
      link: link || "",
      platform: getPlatformFromLink(link || ""),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  return batch.commit();
}

export async function movePosts(postIds: string[], collectionId: string | null) {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  postIds.forEach((postId) => {
    batch.update(doc(db, POSTS, postId), withTimestamps({ collectionId }));
  });
  return batch.commit();
}

export async function deletePosts(postIds: string[]) {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  postIds.forEach((postId) => batch.delete(doc(db, POSTS, postId)));
  return batch.commit();
}

export async function moveCollections(
  collectionIds: string[],
  targetId: string | null,
  collections: CollectionItem[],
) {
  if (isInvalidCollectionMove(collectionIds, targetId, collections)) {
    throw new Error("A collection cannot be moved into itself or one of its descendants.");
  }

  const db = getFirebaseDb();
  const batch = writeBatch(db);
  collectionIds.forEach((collectionId) => {
    batch.update(doc(db, COLLECTIONS, collectionId), withTimestamps({ parentId: targetId }));
  });
  return batch.commit();
}

export async function deleteCollections(
  collectionIds: string[],
  collections: CollectionItem[],
  posts: PostItem[],
  movePostsToId?: string | null,
) {
  const affectedIds = Array.from(
    new Set(collectionIds.flatMap((collectionId) => getDescendantCollectionIds(collectionId, collections))),
  );

  const db = getFirebaseDb();
  const batch = writeBatch(db);

  posts
    .filter((post) => post.collectionId && affectedIds.includes(post.collectionId))
    .forEach((post) => {
      const ref = doc(db, POSTS, post.id);
      if (movePostsToId) {
        batch.update(ref, withTimestamps({ collectionId: movePostsToId }));
        return;
      }
      batch.delete(ref);
    });

  affectedIds.forEach((collectionId) => {
    batch.delete(doc(db, COLLECTIONS, collectionId));
  });

  return batch.commit();
}

export async function fetchMoveTargets(ownerId: string) {
  const q = query(collection(getFirebaseDb(), COLLECTIONS), where("ownerId", "==", ownerId), orderBy(documentId()));
  return new Promise<CollectionItem[]>((resolve, reject) => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        unsubscribe();
        resolve(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as CollectionItem));
      },
      reject,
    );
  });
}
