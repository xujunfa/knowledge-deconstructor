import { atom } from "jotai";
import type { Concept, ConceptExplanation, AppStep } from "@/types/graph";

// 当前步骤
export const stepAtom = atom<AppStep>("input");

// 用户输入的原始文本
export const inputTextAtom = atom("");

// 抽取出的概念列表
export const conceptsAtom = atom<Concept[]>([]);

// 概念解释结果
export const explanationsAtom = atom<ConceptExplanation[]>([]);

// 已选概念（派生）
export const selectedConceptsAtom = atom((get) =>
  get(conceptsAtom).filter((c) => c.selected)
);

// Loading 状态
export const extractingAtom = atom(false);
export const generatingAtom = atom(false);
