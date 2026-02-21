import { toPng } from "html-to-image";
import type { Node } from "@xyflow/react";

/**
 * Export the React Flow viewport as a PNG image
 */
export async function exportToPng(element: HTMLElement): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: "#ffffff",
    quality: 0.95,
    pixelRatio: 2,
  });
  const link = document.createElement("a");
  link.download = `知识解构-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Export the mind map nodes as Markdown text
 */
export function exportToMarkdown(
  nodes: Node[],
  edges: { source: string; target: string }[]
): string {
  const centerNode = nodes.find(
    (n) => (n.data as Record<string, unknown>).isCenter
  );
  if (!centerNode) return "";

  const lines: string[] = [];
  lines.push(
    `# ${(centerNode.data as Record<string, unknown>).label as string}`
  );
  lines.push("");

  // Build adjacency map
  const childrenMap = new Map<string, string[]>();
  for (const edge of edges) {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function renderNode(nodeId: string, depth: number) {
    const node = nodeMap.get(nodeId);
    if (!node || (node.data as Record<string, unknown>).isCenter) return;
    const data = node.data as Record<string, unknown>;
    const indent = "  ".repeat(depth - 1);
    lines.push(
      `${indent}- **${data.label as string}**：${data.explanation as string}`
    );
    const children = childrenMap.get(nodeId) || [];
    for (const childId of children) {
      renderNode(childId, depth + 1);
    }
  }

  const rootChildren = childrenMap.get(centerNode.id) || [];
  for (const childId of rootChildren) {
    renderNode(childId, 1);
  }

  return lines.join("\n");
}

/**
 * Download text content as a file
 */
export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
