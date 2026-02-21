import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;

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

/**
 * Given an angle (radians), return the handle id that best faces that direction.
 * Angle 0 = right, π/2 = down, π = left, -π/2 = up
 */
function handleForAngle(angle: number): string {
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (a < Math.PI / 4 || a >= (7 * Math.PI) / 4) return "right";
  if (a < (3 * Math.PI) / 4) return "bottom";
  if (a < (5 * Math.PI) / 4) return "left";
  return "top";
}

/**
 * 以中心节点为圆心，子节点环形分布
 */
export function computeRadialLayout(input: LayoutInput): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const cx = 0;
  const cy = 0;

  // Center node
  nodes.push({
    id: input.centerId,
    type: "conceptNode",
    position: { x: cx - NODE_WIDTH / 2, y: cy - NODE_HEIGHT / 2 },
    data: {
      label: input.centerLabel,
      explanation: "",
      isCenter: true,
      expanded: input.children.length > 0,
    },
  });

  const count = input.children.length;
  if (count === 0) return { nodes, edges };

  // Scale radius based on node count to avoid overlap
  const minRadius = 420;
  const radius = Math.max(minRadius, count * 100);

  // Start from top (-π/2) and distribute evenly
  const startAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / count;

  input.children.forEach((child, i) => {
    const angle = startAngle + angleStep * i;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    nodes.push({
      id: child.id,
      type: "conceptNode",
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
      data: {
        label: child.label,
        explanation: child.explanation,
        subConcepts: child.subConcepts || [],
        isCenter: false,
        expanded: false,
      },
    });

    const sourceHandle = handleForAngle(angle);
    const targetHandle = handleForAngle(angle + Math.PI);

    edges.push({
      id: `edge-${input.centerId}-${child.id}`,
      source: input.centerId,
      target: child.id,
      sourceHandle,
      targetHandle,
    });
  });

  return { nodes, edges };
}

/**
 * 计算子节点展开后新节点的位置
 */
export function computeExpandLayout(
  parentNode: Node,
  children: {
    id: string;
    label: string;
    explanation: string;
    subConcepts?: string[];
  }[],
  existingNodes: Node[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const parentX = parentNode.position.x + NODE_WIDTH / 2;
  const parentY = parentNode.position.y + NODE_HEIGHT / 2;

  // Find center node to determine outward direction
  const centerNode = existingNodes.find(
    (n) => (n.data as Record<string, unknown>).isCenter
  );
  let baseAngle = 0;
  if (centerNode) {
    const centerX = centerNode.position.x + NODE_WIDTH / 2;
    const centerY = centerNode.position.y + NODE_HEIGHT / 2;
    baseAngle = Math.atan2(parentY - centerY, parentX - centerX);
  }

  const count = children.length;
  const arcSpan = Math.min(Math.PI * 0.8, count * 0.4);
  const radius = 300;

  children.forEach((child, i) => {
    const angleStep = count > 1 ? arcSpan / (count - 1) : 0;
    const angle = baseAngle - arcSpan / 2 + angleStep * i;
    const x = parentX + radius * Math.cos(angle);
    const y = parentY + radius * Math.sin(angle);

    nodes.push({
      id: child.id,
      type: "conceptNode",
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
      data: {
        label: child.label,
        explanation: child.explanation,
        subConcepts: child.subConcepts || [],
        isCenter: false,
        expanded: false,
      },
    });

    const sourceHandle = handleForAngle(angle);
    const targetHandle = handleForAngle(angle + Math.PI);

    edges.push({
      id: `edge-${parentNode.id}-${child.id}`,
      source: parentNode.id,
      target: child.id,
      sourceHandle,
      targetHandle,
    });
  });

  return { nodes, edges };
}
