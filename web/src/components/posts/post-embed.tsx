"use client";

import { useEffect, useRef, useState } from "react";
import { PostItem } from "@/types";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    FB?: {
      XFBML: {
        parse: (element?: HTMLElement | null) => void;
      };
    };
    tiktokEmbed?: {
      lib: {
        render: () => void;
      };
    };
  }
}

type PostEmbedProps = {
  post: PostItem;
};

export function PostEmbed({ post }: PostEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Helper to load external scripts dynamically
  const loadScript = (src: string, checkGlobal: string, callback: () => void) => {
    // If global already exists, call callback directly
    if ((window as any)[checkGlobal]) {
      callback();
      return;
    }

    const selector = `script[src*="${src.split("?")[0].replace("https:", "").replace("http:", "")}"]`;
    const existing = document.querySelector(selector);

    if (!existing) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
      script.onload = () => callback();
    } else {
      // Script is already added, but global is not yet available, wait slightly
      const interval = setInterval(() => {
        if ((window as any)[checkGlobal]) {
          clearInterval(interval);
          callback();
        }
      }, 50);
      setTimeout(() => clearInterval(interval), 5000); // safety timeout
    }
  };

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      if (post.platform === "instagram") {
        const loadInstagram = () => {
          try {
            window.instgrm?.Embeds?.process();
          } catch (e) {
            console.error("Error processing Instagram embed:", e);
          } finally {
            setLoading(false);
          }
        };

        if (window.instgrm) {
          loadInstagram();
        } else {
          loadScript("https://www.instagram.com/embed.js", "instgrm", loadInstagram);
        }
      } else if (post.platform === "facebook") {
        // Ensure fb-root exists
        if (!document.getElementById("fb-root")) {
          const fbRoot = document.createElement("div");
          fbRoot.id = "fb-root";
          document.body.appendChild(fbRoot);
        }

        const loadFB = () => {
          try {
            if (window.FB && containerRef.current) {
              window.FB.XFBML.parse(containerRef.current);
            }
          } catch (e) {
            console.error("Error parsing Facebook embed:", e);
          } finally {
            setLoading(false);
          }
        };

        if (window.FB) {
          loadFB();
        } else {
          loadScript(
            "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0",
            "FB",
            loadFB
          );
        }
      } else if (post.platform === "tiktok") {
        const loadTikTok = () => {
          try {
            window.tiktokEmbed?.lib?.render();
          } catch (e) {
            console.error("Error rendering TikTok embed:", e);
          } finally {
            setLoading(false);
          }
        };

        if (window.tiktokEmbed) {
          loadTikTok();
        } else {
          loadScript("https://www.tiktok.com/embed.js", "tiktokEmbed", loadTikTok);
        }
      } else {
        // YouTube and other platforms load quickly/statically
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [post.link, post.platform]);

  // Render logic
  if (post.platform === "instagram") {
    return (
      <div className="embed-wrapper embed-wrapper--instagram" ref={containerRef}>
        {loading && (
          <div className="embed-loader">
            <span className="spinner" style={{ width: 24, height: 24 }} />
            <span>Loading Instagram embed…</span>
          </div>
        )}
        <blockquote
          key={post.link}
          className="instagram-media"
          data-instgrm-permalink={post.link}
          data-instgrm-version="14"
          style={{
            maxWidth: "540px",
            width: "calc(100% - 2px)",
            margin: "0 auto",
            background: "transparent",
          }}
        />
      </div>
    );
  }

  if (post.platform === "facebook") {
    return (
      <div className="embed-wrapper embed-wrapper--facebook" ref={containerRef}>
        {loading && (
          <div className="embed-loader">
            <span className="spinner" style={{ width: 24, height: 24 }} />
            <span>Loading Facebook embed…</span>
          </div>
        )}
        <div
          key={post.link}
          className="fb-video"
          data-href={post.link}
          data-width="auto"
          data-show-text="false"
          data-show-captions="true"
          data-autoplay="false"
          style={{
            maxWidth: "500px",
            width: "100%",
            margin: "0 auto",
          }}
        />
      </div>
    );
  }

  if (post.platform === "tiktok") {
    const videoId = getTikTokVideoId(post.link);
    return (
      <div className="embed-wrapper embed-wrapper--tiktok" ref={containerRef}>
        {loading && (
          <div className="embed-loader">
            <span className="spinner" style={{ width: 24, height: 24 }} />
            <span>Loading TikTok embed…</span>
          </div>
        )}
        <blockquote
          key={post.link}
          className="tiktok-embed"
          cite={post.link}
          data-video-id={videoId || undefined}
          style={{
            maxWidth: "605px",
            minWidth: "325px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <section>
            <a target="_blank" rel="noreferrer" href={post.link}>
              {post.link}
            </a>
          </section>
        </blockquote>
      </div>
    );
  }

  if (post.platform === "youtube") {
    const embedUrl = getYouTubeEmbedUrl(post.link);
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          title={post.title}
          className="post-iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }
  }

  // Fallback for other platforms / generic URLs
  return (
    <>
      <iframe src={post.link} title={post.title} className="post-iframe" />
      <div className="iframe-overlay-hint">
        <p>If the content below does not load, the platform may be blocking embedded views.</p>
        <a href={post.link} target="_blank" rel="noreferrer" className="post-single-link">
          Open original post
        </a>
      </div>
    </>
  );
}

// Utility functions
function getTikTokVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.substring(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.includes("/watch")) {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      } else if (parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1];
      }
    }

    if (videoId) {
      videoId = videoId.split("?")[0].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  } catch {
    return null;
  }
}
