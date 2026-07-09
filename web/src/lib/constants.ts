import { PostPlatform } from "@/types";

export const ROOT_COLLECTION_ID = "root";

export const platformLabels: Record<PostPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  other: "Other",
};

export const supportedHosts = [
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
];
