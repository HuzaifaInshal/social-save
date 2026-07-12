"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useWorkspace } from "@/hooks/use-workspace";
import { createPost, deletePosts } from "@/lib/firebase/firestore";

import { getFirebaseConfig } from "@/lib/firebase/config";

export function ExtensionBridge() {
  const { user } = useAuth();
  const { collections, posts } = useWorkspace(user?.uid);

  useEffect(() => {
    const handleExtensionRequest = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { action, payload } = customEvent.detail;
      let response: any = null;

      if (!user) {
        if (action === "GET_STATUS") {
          response = { authenticated: false };
        } else {
          response = { success: false, error: "Not authenticated" };
        }
      } else {
        if (action === "GET_STATUS") {
          response = {
            authenticated: true,
            uid: user.uid,
            refreshToken: user.refreshToken,
            firebaseConfig: getFirebaseConfig(),
            collections: collections.map((c) => ({
              id: c.id,
              title: c.title,
              parentId: c.parentId,
            })),
            posts: posts.map((p) => ({
              id: p.id,
              link: p.link,
              title: p.title,
              collectionId: p.collectionId,
            })),
          };
        } else if (action === "ADD_BOOKMARK") {
          try {
            await createPost(user.uid, {
              title: payload.title,
              description: payload.description || "",
              link: payload.link,
              collectionId: payload.collectionId || null,
            });
            response = { success: true };
          } catch (err) {
            response = {
              success: false,
              error: err instanceof Error ? err.message : String(err),
            };
          }
        } else if (action === "REMOVE_BOOKMARK") {
          try {
            const targetPost = posts.find((p) => p.link === payload.link);
            if (targetPost) {
              await deletePosts([targetPost.id]);
              response = { success: true };
            } else {
              response = { success: false, error: "Post not found" };
            }
          } catch (err) {
            response = {
              success: false,
              error: err instanceof Error ? err.message : String(err),
            };
          }
        }
      }

      const responseEvent = new CustomEvent("SOCIAL_SAVE_EXT_RESPONSE", {
        detail: { action, response },
      });
      window.dispatchEvent(responseEvent);
    };

    window.addEventListener("SOCIAL_SAVE_EXT_REQUEST", handleExtensionRequest);
    return () => {
      window.removeEventListener("SOCIAL_SAVE_EXT_REQUEST", handleExtensionRequest);
    };
  }, [collections, posts, user]);

  return null;
}
