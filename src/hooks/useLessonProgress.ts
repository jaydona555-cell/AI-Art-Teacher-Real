import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "atelier_lesson_progress";

type ProgressMap = Record<string, { completed: boolean; practiced: boolean; completedAt: string | null }>;

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProgressMap;
  } catch { /* ignore */ }
  return {};
}

function saveProgress(progress: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* ignore */ }
}

export function useLessonProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const markCompleted = useCallback((techniqueId: string) => {
    setProgress((prev) => {
      const existing = prev[techniqueId] || { completed: false, practiced: false, completedAt: null };
      if (existing.completed) return prev;
      const updated = {
        ...prev,
        [techniqueId]: { ...existing, completed: true, completedAt: new Date().toISOString() },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const markPracticed = useCallback((techniqueId: string) => {
    setProgress((prev) => {
      const existing = prev[techniqueId] || { completed: false, practiced: false, completedAt: null };
      if (existing.practiced) return prev;
      const updated = {
        ...prev,
        [techniqueId]: { ...existing, practiced: true },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const getProgress = useCallback((techniqueId: string) => {
    return progress[techniqueId] || { completed: false, practiced: false, completedAt: null };
  }, [progress]);

  const getMediumProgress = useCallback((techniqueIds: string[]) => {
    const completed = techniqueIds.filter((id) => progress[id]?.completed).length;
    const practiced = techniqueIds.filter((id) => progress[id]?.practiced).length;
    return { completed, practiced, total: techniqueIds.length };
  }, [progress]);

  return { progress, markCompleted, markPracticed, getProgress, getMediumProgress };
}
