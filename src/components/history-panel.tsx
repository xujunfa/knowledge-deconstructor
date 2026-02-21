"use client";

import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { inputTextAtom, stepAtom, conceptsAtom } from "@/store/atoms";
import {
  getHistory,
  clearHistory,
  type HistoryRecord,
} from "@/store/history";

export function HistoryPanel() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const setInputText = useSetAtom(inputTextAtom);
  const setStep = useSetAtom(stepAtom);
  const setConcepts = useSetAtom(conceptsAtom);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  if (records.length === 0) return null;

  const handleRestore = (record: HistoryRecord) => {
    setInputText(record.text);
    setConcepts(
      record.concepts.map((name, i) => ({
        id: `concept-${i}`,
        name,
        selected: true,
      }))
    );
    setStep("selecting");
  };

  const handleClear = () => {
    clearHistory();
    setRecords([]);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-muted-foreground">
          最近记录
        </h3>
        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClear}>
          清除
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        {records.slice(0, 5).map((record) => (
          <button
            key={record.id}
            className="rounded-md border p-2 text-left text-xs hover:bg-muted/50 transition-colors"
            onClick={() => handleRestore(record)}
          >
            <div className="line-clamp-2 text-foreground">
              {record.text}
            </div>
            <div className="mt-1 text-muted-foreground">
              {record.concepts.length} 个概念 ·{" "}
              {new Date(record.createdAt).toLocaleDateString("zh-CN")}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
