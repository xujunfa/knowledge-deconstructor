"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  conceptsAtom,
  selectedConceptsAtom,
  stepAtom,
  generatingAtom,
} from "@/store/atoms";

export function ConceptList() {
  const [concepts, setConcepts] = useAtom(conceptsAtom);
  const selectedConcepts = useAtomValue(selectedConceptsAtom);
  const setStep = useSetAtom(stepAtom);
  const generating = useAtomValue(generatingAtom);

  const toggleConcept = (id: string) => {
    setConcepts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleStart = () => {
    if (selectedConcepts.length === 0) return;
    setStep("generating");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        AI 识别出以下概念，勾选你想深入了解的：
      </p>
      <div className="flex flex-col gap-2">
        {concepts.map((concept) => (
          <label
            key={concept.id}
            className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={concept.selected}
              onCheckedChange={() => toggleConcept(concept.id)}
              disabled={generating}
            />
            <span>{concept.name}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep("input")}
          disabled={generating}
        >
          返回修改
        </Button>
        <Button
          onClick={handleStart}
          disabled={selectedConcepts.length === 0 || generating}
          className="flex-1"
        >
          {generating ? "生成中..." : `开始解构（${selectedConcepts.length}）`}
        </Button>
      </div>
    </div>
  );
}
