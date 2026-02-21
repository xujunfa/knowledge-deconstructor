import { type Node, type Edge, Position } from "@xyflow/react";


const NODE_HEIGHT = 160; 
const DX = 360; // Horizontal spacing between levels
const DY = 20; // Vertical gap between nodes

export interface LayoutInput {
  centerId: string;
  centerLabel: string;
  children: {
    id: string;
    label: string;
    explanation: string;
    subConcepts?: string[];
  }[];
}

export function computeInitialLayout(input: LayoutInput): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: input.centerId,
    type: "conceptNode",
    position: { x: 0, y: 0 },
    data: {
      label: input.centerLabel,
      explanation: "",
      isCenter: true,
      expanded: input.children.length > 0,
    },
  });

  input.children.forEach((child) => {
    nodes.push({
      id: child.id,
      type: "conceptNode",
      position: { x: 0, y: 0 },
      data: {
        label: child.label,
        explanation: child.explanation,
        subConcepts: child.subConcepts || [],
        isCenter: false,
        expanded: false,
      },
    });

    edges.push({
      id: `edge-${input.centerId}-${child.id}`,
      source: input.centerId,
      target: child.id,
      sourceHandle: 'right',
      targetHandle: 'left',
    });
  });

  return getLayoutedElements(nodes, edges);
}

export function getLayoutedElements(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  // Build adjacency list
  const childrenMap = new Map<string, string[]>();
  nodes.forEach(n => childrenMap.set(n.id, []));
  edges.forEach(e => {
    if (childrenMap.has(e.source)) {
      childrenMap.get(e.source)!.push(e.target);
    }
  });

  // Find root
  const targets = new Set(edges.map(e => e.target));
  let rootId = nodes.find(n => !targets.has(n.id))?.id;
  if (!rootId && nodes.length > 0) rootId = nodes[0].id;

  if (!rootId) return { nodes, edges };

  // Calculate heights of subtrees
  const treeHeights = new Map<string, number>();
  
  function calculateHeight(id: string): number {
    const children = childrenMap.get(id) || [];
    if (children.length === 0) {
      treeHeights.set(id, NODE_HEIGHT);
      return NODE_HEIGHT;
    }
    let sum = 0;
    for (const childId of children) {
      sum += calculateHeight(childId);
    }
    const totalHeight = sum + (children.length - 1) * DY;
    const height = Math.max(NODE_HEIGHT, totalHeight);
    treeHeights.set(id, height);
    return height;
  }

  calculateHeight(rootId);

  // Now assign positions based on heights
  const newPositions = new Map<string, {x: number, y: number}>();
  const nodeMap = new Map<string, Node>(nodes.map(n => [n.id, n]));
  
  function assignPosition(id: string, x: number, yCenter: number) {
    newPositions.set(id, { x, y: yCenter - NODE_HEIGHT / 2 });

    const children = childrenMap.get(id) || [];
    if (children.length === 0) return;

    let childrenBlockHeight = 0;
    children.forEach(c => { childrenBlockHeight += treeHeights.get(c)!; });
    childrenBlockHeight += (children.length - 1) * DY;

    let currentY = yCenter - childrenBlockHeight / 2;

    const node = nodeMap.get(id);
    const isCenter = node?.data?.isCenter;
    const currentDX = isCenter ? 480 : DX;

    for (const childId of children) {
      const childHeight = treeHeights.get(childId)!;
      const childYCenter = currentY + childHeight / 2;
      assignPosition(childId, x + currentDX, childYCenter);
      currentY += childHeight + DY;
    }
  }

  // Root at X=0, YCenter=0
  assignPosition(rootId, 0, 0);

  const layoutedNodes = nodes.map(n => ({
    ...n,
    position: newPositions.get(n.id) || n.position,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));

  const layoutedEdges = edges.map(e => ({
    ...e,
    sourceHandle: 'right',
    targetHandle: 'left',
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
}
