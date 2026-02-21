"use client";

import { useAtomValue } from "jotai";
import { stepAtom } from "@/store/atoms";
import { TextInput } from "@/components/text-input";
import { ConceptList } from "@/components/concept-list";
import { MindMap } from "@/components/mind-map";
import { ThemeToggle } from "@/components/theme-toggle";
import { HistoryPanel } from "@/components/history-panel";

export default function Home() {
  const step = useAtomValue(stepAtom);
  const showMap = step === "generating" || step === "map";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
        <div>
          <h1 className="text-lg font-semibold md:text-xl">知识解构器</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            粘贴文本，AI 自动拆解概念，以思维导图方式逐层展开大白话解释
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Panel */}
        <section
          className={`
            shrink-0 border-b p-4 overflow-y-auto md:w-[400px] md:border-b-0 md:border-r md:p-6
            ${showMap ? "hidden md:block" : ""}
          `}
        >
          {step === "input" && (
            <>
              <TextInput />
              <HistoryPanel />
            </>
          )}
          {(step === "selecting" || step === "generating" || step === "map") && (
            <ConceptList />
          )}
        </section>

        {/* Right Panel: Mind Map Area */}
        <section
          className={`
            flex-1 relative min-h-[400px]
            ${!showMap ? "hidden md:flex" : "flex"}
          `}
        >
          {showMap ? (
            <MindMap />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {step === "input" && "在左侧输入文本，AI 将自动识别其中的概念"}
                {step === "selecting" && "勾选想了解的概念，点击「开始解构」"}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
