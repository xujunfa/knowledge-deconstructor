"use client";

import { useCallback, useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportToPng, exportToMarkdown, downloadText } from "@/lib/export";

export function ExportButton() {
  const { getNodes, getEdges } = useReactFlow();
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleExportPng = useCallback(async () => {
    setExporting(true);
    setOpen(false);
    try {
      const viewport = document.querySelector(
        ".react-flow__viewport"
      ) as HTMLElement;
      if (!viewport) throw new Error("未找到画布");
      await exportToPng(viewport);
      toast.success("PNG 导出成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "导出失败");
    } finally {
      setExporting(false);
    }
  }, []);

  const handleExportMarkdown = useCallback(() => {
    setOpen(false);
    const nodes = getNodes();
    const edges = getEdges();
    const md = exportToMarkdown(nodes, edges);
    if (!md) {
      toast.error("无内容可导出");
      return;
    }
    downloadText(md, `知识解构-${Date.now()}.md`);
    toast.success("Markdown 导出成功");
  }, [getNodes, getEdges]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={exporting}
      >
        {exporting ? "导出中..." : "导出"}
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-md border bg-popover p-1 shadow-md">
          <button
            className="w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-accent"
            onClick={handleExportPng}
          >
            导出 PNG
          </button>
          <button
            className="w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-accent"
            onClick={handleExportMarkdown}
          >
            导出 Markdown
          </button>
        </div>
      )}
    </div>
  );
}
