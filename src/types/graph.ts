export interface Concept {
  id: string;
  name: string;
  selected: boolean;
}

export interface ConceptExplanation {
  conceptId: string;
  name: string;
  explanation: string;
  subConcepts?: string[];
}

export type AppStep = "input" | "selecting" | "generating" | "map";
