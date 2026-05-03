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

export function CollectionTree({
  nodes,
  activeId,
  selectedIds,
  onOpen,
  onToggleSelect,
}: CollectionTreeProps) {
  return (
    <div className="tree">
      <button
        className={cn("tree__root", activeId === null && "tree__item--active")}
        onClick={() => onOpen(null)}
      >
        All collections
      </button>
      {nodes.map((node) => (
        <CollectionTreeNode
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

type NodeProps = Omit<CollectionTreeProps, "nodes"> & {
  node: CollectionNode;
  depth: number;
};

function CollectionTreeNode({ node, depth, activeId, selectedIds, onOpen, onToggleSelect }: NodeProps) {
  return (
    <div>
      <div
        className={cn("tree__item", activeId === node.id && "tree__item--active")}
        style={{ paddingLeft: `${depth * 18 + 10}px` }}
      >
        <input
          type="checkbox"
          checked={selectedIds.includes(node.id)}
          onChange={() => onToggleSelect(node.id)}
          aria-label={`Select ${node.title}`}
        />
        <button className="tree__label" onClick={() => onOpen(node.id)}>
          <span>{node.title}</span>
          <small>{node.postCount} posts</small>
        </button>
      </div>
      {node.children.map((child) => (
        <CollectionTreeNode
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
