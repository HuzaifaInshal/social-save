"use client";

import { CollectionNode } from "@/types";
import { cn } from "@/lib/utils";

/** Rotating colors for collection dot indicators */
const DOT_COLORS = [
  "#7c5cfc", "#e879a8", "#f59e42", "#34d399", "#60a5fa",
  "#c084fc", "#fb7185", "#fbbf24", "#22d3ee", "#a78bfa",
];

type CollectionTreeProps = {
  nodes: CollectionNode[];
  activeId: string | null;
  selectedIds: string[];
  onOpen: (id: string | null) => void;
  onToggleSelect: (id: string) => void;
};

export function CollectionTree({ nodes, activeId, selectedIds, onOpen, onToggleSelect }: CollectionTreeProps) {
  return (
    <div className="tree">
      <button
        className={cn("sidebar__all-btn", activeId === null && "sidebar__all-btn--active")}
        onClick={() => onOpen(null)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        All Collections
      </button>
      {nodes.map((node, index) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          index={index}
          activeId={activeId}
          selectedIds={selectedIds}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}

type NodeProps = Omit<CollectionTreeProps, "nodes"> & { node: CollectionNode; depth: number; index: number };

function TreeNode({ node, depth, index, activeId, selectedIds, onOpen, onToggleSelect }: NodeProps) {
  const dotColor = DOT_COLORS[index % DOT_COLORS.length];

  return (
    <div>
      <button
        className={cn("tree__item", activeId === node.id && "tree__item--active")}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
        onClick={() => onOpen(node.id)}
      >
        <span className="tree__item-dot" style={{ background: dotColor }} />
        <span className="tree__item-name">{node.title}</span>
        <span className="tree__item-count">{node.postCount}</span>
      </button>
      {node.children.map((child, childIndex) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          index={index + childIndex + 1}
          activeId={activeId}
          selectedIds={selectedIds}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
