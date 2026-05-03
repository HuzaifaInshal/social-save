import { CollectionItem, CollectionNode, PostItem, PostPlatform } from "@/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function getPlatformFromLink(link: string): PostPlatform {
  try {
    const host = new URL(link).hostname.replace("www.", "");
    if (host.includes("facebook.com")) return "facebook";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("tiktok.com")) return "tiktok";
    return "other";
  } catch {
    return "other";
  }
}

export function buildCollectionTree(
  collections: CollectionItem[],
  posts: PostItem[],
): CollectionNode[] {
  const postCounts = posts.reduce<Record<string, number>>((acc, post) => {
    const key = post.collectionId ?? "root";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const nodes = new Map<string, CollectionNode>();
  collections.forEach((collection) => {
    nodes.set(collection.id, { ...collection, children: [], postCount: postCounts[collection.id] ?? 0 });
  });

  const roots: CollectionNode[] = [];
  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
      return;
    }
    roots.push(node);
  });

  const sortNodes = (items: CollectionNode[]) => {
    items.sort((a, b) => a.title.localeCompare(b.title));
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);
  return roots;
}

export function getDescendantCollectionIds(
  collectionId: string,
  collections: CollectionItem[],
): string[] {
  const byParent = collections.reduce<Record<string, string[]>>((acc, item) => {
    const key = item.parentId ?? "root";
    acc[key] = [...(acc[key] ?? []), item.id];
    return acc;
  }, {});

  const results: string[] = [];
  const walk = (currentId: string) => {
    results.push(currentId);
    (byParent[currentId] ?? []).forEach(walk);
  };

  walk(collectionId);
  return results;
}

export function isInvalidCollectionMove(
  sourceIds: string[],
  targetId: string | null,
  collections: CollectionItem[],
) {
  if (!targetId) return false;
  if (sourceIds.includes(targetId)) return true;
  return sourceIds.some((sourceId) => {
    const descendants = getDescendantCollectionIds(sourceId, collections);
    return descendants.includes(targetId);
  });
}
