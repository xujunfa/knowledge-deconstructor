"use client";

import { useAtom, useSetAtom } from "jotai";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  inputTextAtom,
  conceptsAtom,
  stepAtom,
  extractingAtom,
} from "@/store/atoms";
import { addHistory } from "@/store/history";

export function TextInput() {
  const [inputText, setInputText] = useAtom(inputTextAtom);
  const setConcepts = useSetAtom(conceptsAtom);
  const setStep = useSetAtom(stepAtom);
  const [extracting, setExtracting] = useAtom(extractingAtom);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setExtracting(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!data.concepts || data.concepts.length === 0) {
        toast.info("未识别到需要解释的概念，请尝试输入其他文本");
        return;
      }
      setConcepts(
        data.concepts.map((name: string, i: number) => ({
          id: `concept-${i}`,
          name,
          selected: true,
        }))
      );
      addHistory(inputText, data.concepts);
      setStep("selecting");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "抽取失败，请重试", {
        action: { label: "重试", onClick: handleExtract },
      });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        placeholder="在此粘贴你想要理解的文本内容...&#10;&#10;例如：量子纠缠是一种量子力学现象，当一对或一组粒子产生、相互作用或共享空间邻近性时..."
        className="min-h-[200px] resize-none"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={extracting}
      />
      <div className="text-xs text-muted-foreground">
        {inputText.length > 0 && `${inputText.length} / 5000 字`}
      </div>
      <Button
        onClick={handleExtract}
        disabled={!inputText.trim() || extracting}
      >
        {extracting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            正在分析...
          </span>
        ) : (
          "提取概念"
        )}
      </Button>
    </div>
  );
}
