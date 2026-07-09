"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeToCollections, subscribeToPosts } from "@/lib/firebase/firestore";
import { buildCollectionTree } from "@/lib/utils";
import { CollectionItem, PostItem } from "@/types";

export function useWorkspace(ownerId?: string) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) {
      setCollections([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribeCollections = subscribeToCollections(ownerId, (items) => {
      setCollections(items);
      setLoading(false);
    });

    const unsubscribePosts = subscribeToPosts(ownerId, setPosts);

    return () => {
      unsubscribeCollections();
      unsubscribePosts();
    };
  }, [ownerId]);

  const tree = useMemo(() => buildCollectionTree(collections, posts), [collections, posts]);

  return { collections, posts, tree, loading };
}
