export type ThemeMode = "light" | "dark";

export type CollectionItem = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type PostPlatform = "facebook" | "instagram" | "youtube" | "tiktok" | "other";

export type PostItem = {
  id: string;
  ownerId: string;
  collectionId: string | null;
  title: string;
  description: string;
  link: string;
  platform: PostPlatform;
  createdAt: number;
  updatedAt: number;
};

export type CollectionNode = CollectionItem & {
  children: CollectionNode[];
  postCount: number;
};

export type SelectionState = {
  collectionIds: string[];
  postIds: string[];
};

export type CollectionFormValues = Pick<CollectionItem, "title" | "description"> & {
  parentId: string | null;
};

export type PostFormValues = Pick<PostItem, "title" | "description" | "link"> & {
  collectionId: string | null;
};
