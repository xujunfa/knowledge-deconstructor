"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface ConceptNodeData {
  label: string;
  explanation: string;
  subConcepts?: string[];
  isCenter?: boolean;
  expanded?: boolean;
  loading?: boolean;
  [key: string]: unknown;
}

const HANDLE_CLASS = "!opacity-0 !w-1 !h-1 !min-w-0 !min-h-0";

function ConceptNodeComponent({ data }: NodeProps) {
  const { label, explanation, isCenter, expanded, loading } =
    data as ConceptNodeData;

  return (
    <div
      className={`
        rounded-lg border bg-card px-4 py-3 shadow-sm transition-all
        ${isCenter ? "border-primary bg-primary/5 min-w-[200px] max-w-[280px]" : "min-w-[180px] max-w-[240px]"}
        ${expanded ? "border-muted-foreground/30" : "border-border"}
        ${!isCenter && !expanded ? "cursor-pointer hover:shadow-md hover:border-primary/50" : ""}
        ${loading ? "animate-pulse" : ""}
      `}
    >
      <Handle type="source" id="top" position={Position.Top} className={HANDLE_CLASS} />
      <Handle type="source" id="bottom" position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle type="source" id="left" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="source" id="right" position={Position.Right} className={HANDLE_CLASS} />
      <Handle type="target" id="top" position={Position.Top} className={HANDLE_CLASS} />
      <Handle type="target" id="bottom" position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle type="target" id="left" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="target" id="right" position={Position.Right} className={HANDLE_CLASS} />

      <div className="text-sm font-medium">{label}</div>
      {explanation && (
        <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {explanation}
        </div>
      )}
      {!isCenter && !expanded && (
        <div className="mt-1 text-[10px] text-primary/60">点击展开</div>
      )}
    </div>
  );
}

export const ConceptNode = memo(ConceptNodeComponent);
