"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAtomValue, useSetAtom } from "jotai";
import { toast } from "sonner";
import {
  inputTextAtom,
  selectedConceptsAtom,
  explanationsAtom,
  generatingAtom,
  stepAtom,
} from "@/store/atoms";
import { computeRadialLayout, computeExpandLayout } from "@/lib/layout";
import { ConceptNode } from "./concept-node";
import { ExportButton } from "./export-button";
import type { ConceptExplanation } from "@/types/graph";

const nodeTypes = { conceptNode: ConceptNode };

function MindMapInner() {
  const inputText = useAtomValue(inputTextAtom);
  const selectedConcepts = useAtomValue(selectedConceptsAtom);
  const setExplanations = useSetAtom(explanationsAtom);
  const setGenerating = useSetAtom(generatingAtom);
  const setStep = useSetAtom(stepAtom);

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  useEffect(() => {
    const generate = async () => {
      setGenerating(true);
      try {
        const conceptNames = selectedConcepts.map((c) => c.name);
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText, concepts: conceptNames }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const explanations: ConceptExplanation[] = data.explanations.map(
          (
            e: { name: string; explanation: string; subConcepts?: string[] },
            i: number
          ) => ({
            conceptId: `node-${i}`,
            ...e,
          })
        );
        setExplanations(explanations);

        const summary =
          inputText.length > 30 ? inputText.slice(0, 30) + "..." : inputText;
        const layoutInput = {
          centerId: "center",
          centerLabel: summary,
          children: explanations.map((e, i) => ({
            id: `node-${i}`,
            label: e.name,
            explanation: e.explanation,
            subConcepts: e.subConcepts,
          })),
        };

        const { nodes: layoutNodes, edges: layoutEdges } =
          computeRadialLayout(layoutInput);
        setNodes(layoutNodes);
        setEdges(layoutEdges);
        setStep("map");
        toast.success("思维导图生成完成");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "生成失败，请重试"
        );
        setStep("selecting");
      } finally {
        setGenerating(false);
      }
    };

    if (selectedConcepts.length > 0 && nodes.length === 0) {
      generate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onNodeClick = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      const data = node.data as Record<string, unknown>;
      if (data.isCenter || data.expanded || data.loading) return;

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, loading: true } } : n
        )
      );

      try {
        const res = await fetch("/api/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: inputText,
            concept: data.label,
            existingExplanation: data.explanation,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        const children = result.explanations.map(
          (
            e: { name: string; explanation: string; subConcepts?: string[] },
            i: number
          ) => ({
            id: `${node.id}-sub-${i}`,
            label: e.name,
            explanation: e.explanation,
            subConcepts: e.subConcepts,
          })
        );

        const { nodes: newNodes, edges: newEdges } = computeExpandLayout(
          node,
          children,
          nodes
        );

        setNodes((nds) => [
          ...nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, expanded: true, loading: false } }
              : n
          ),
          ...newNodes,
        ]);
        setEdges((eds) => [...eds, ...newEdges]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "展开失败，请重试"
        );
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, loading: false } }
              : n
          )
        );
      }
    },
    [inputText, nodes, setNodes, setEdges]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "bezier",
      animated: true,
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.1}
      maxZoom={2}
    >
      <Background />
      <Controls />
      {nodes.length > 0 && (
        <Panel position="top-right">
          <ExportButton />
        </Panel>
      )}
    </ReactFlow>
  );
}

export function MindMap() {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <MindMapInner />
      </ReactFlowProvider>
    </div>
  );
}
