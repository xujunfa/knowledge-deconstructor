export interface HistoryRecord {
  id: string;
  text: string;
  concepts: string[];
  createdAt: number;
}

const STORAGE_KEY = "vkd-history";
const MAX_RECORDS = 20;

export function getHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(text: string, concepts: string[]): void {
  const records = getHistory();
  const record: HistoryRecord = {
    id: `h-${Date.now()}`,
    text: text.slice(0, 200),
    concepts,
    createdAt: Date.now(),
  };
  records.unshift(record);
  if (records.length > MAX_RECORDS) records.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
