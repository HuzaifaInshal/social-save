"use client";

import { CollectionNode } from "@/types";
import { cn } from "@/lib/utils";

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
        <span style={{ fontSize: "0.85rem" }}>⊞</span>
        All collections
      </button>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          activeId={activeId}
          selectedIds={selectedIds}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}

type NodeProps = Omit<CollectionTreeProps, "nodes"> & { node: CollectionNode; depth: number };

function TreeNode({ node, depth, activeId, selectedIds, onOpen, onToggleSelect }: NodeProps) {
  return (
    <div>
      <div
        className={cn("tree__item", activeId === node.id && "tree__item--active")}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
      >
        <label className="selector tree__item-checkbox" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selectedIds.includes(node.id)}
            onChange={() => onToggleSelect(node.id)}
            aria-label={`Select ${node.title}`}
          />
          <span className="selector__box" />
        </label>
        <button
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "inherit", padding: 0, minWidth: 0 }}
          onClick={() => onOpen(node.id)}
        >
          <span className="tree__item-name">{node.title}</span>
          <span className="tree__item-count">{node.postCount}</span>
        </button>
      </div>
      {node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          activeId={activeId}
          selectedIds={selectedIds}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
