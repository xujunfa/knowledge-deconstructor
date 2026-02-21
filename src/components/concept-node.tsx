"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, useReactFlow, type Node, type Edge } from "@xyflow/react";
import { Network } from "lucide-react";
import { useAtomValue } from "jotai";
import { inputTextAtom } from "@/store/atoms";
import { getLayoutedElements } from "@/lib/layout";
import { toast } from "sonner";

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

function ConceptNodeComponent({ id, data }: NodeProps) {
  const { label, explanation, isCenter, expanded, loading } =
    data as ConceptNodeData;
    
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const inputText = useAtomValue(inputTextAtom);

  const onDeconstruct = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCenter || expanded || loading) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, loading: true } } : n,
      ),
    );

    try {
      const res = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          concept: label,
          existingExplanation: explanation,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      const children = result.explanations.map(
        (
          e: { name: string; explanation: string; subConcepts?: string[] },
          i: number,
        ) => ({
          id: `${id}-sub-${i}`,
          label: e.name,
          explanation: e.explanation,
          subConcepts: e.subConcepts,
        }),
      );

      const newNodes: Node[] = children.map((c: { id: string; label: string; explanation: string; subConcepts?: string[] }) => ({
        id: c.id,
        type: "conceptNode",
        position: { x: 0, y: 0 },
        data: {
          label: c.label,
          explanation: c.explanation,
          subConcepts: c.subConcepts || [],
          isCenter: false,
          expanded: false,
        },
      }));

      const newEdges: Edge[] = children.map((c: { id: string }) => ({
        id: `edge-${id}-${c.id}`,
        source: id,
        target: c.id,
      }));

      const nodes = getNodes();
      const edges = getEdges();

      const updatedNodes = nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, expanded: true, loading: false } }
          : n,
      ).concat(newNodes);

      const updatedEdges = edges.concat(newEdges);

      const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(
        updatedNodes,
        updatedEdges,
      );

      setNodes(layoutNodes);
      setEdges(layoutEdges);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "展开失败，请重试");
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, loading: false } }
            : n,
        ),
      );
    }
  };

  return (
    <div
      className={`
        group relative rounded-lg border bg-card px-4 py-3 shadow-sm transition-all
        ${isCenter ? "border-primary bg-primary/5 min-w-[200px] max-w-[360px]" : "min-w-[180px] max-w-[240px]"}
        ${expanded ? "border-muted-foreground/30" : "border-border"}
        ${!isCenter && !expanded ? "hover:shadow-md hover:border-primary/50" : ""}
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

      <div className={`text-sm font-medium ${isCenter ? "line-clamp-[15] whitespace-pre-wrap break-words" : ""}`}>{label}</div>
      {explanation && (
        <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {explanation}
        </div>
      )}
      
      {!isCenter && !expanded && !loading && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-10 translate-y-2 group-hover:translate-y-0 pb-2">
          <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
            <button
              onClick={onDeconstruct}
              className="flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="知识解构"
            >
              <Network className="w-3.5 h-3.5" />
              <span>解构</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ConceptNode = memo(ConceptNodeComponent);
