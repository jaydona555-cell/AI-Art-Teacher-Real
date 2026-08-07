import { useState, useEffect, useCallback } from "react";
import { supabase, ARTWORKS_BUCKET } from "@/lib/supabase";
import type { SkillLevel, CritiquePin } from "@/lib/scoring";

export interface PortfolioEntry {
  id: string;
  image_url: string;
  image_path: string;
  skill_level: SkillLevel;
  tokens_earned: number;
  feedback: string;
  critique_pins: CritiquePin[];
  medium: string;
  medium_match: boolean;
  is_analog: boolean;
  experimentation_level: "high" | "medium" | "low";
  created_at: string;
}

export interface NewPortfolioEntry {
  file: File;
  skillLevel: SkillLevel;
  tokensEarned: number;
  feedback: string;
  critiquePins: CritiquePin[];
  medium: string;
  mediumMatch: boolean;
  isAnalog: boolean;
  experimentationLevel: "high" | "medium" | "low";
}

export function usePortfolio() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("portfolio_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setEntries((data as PortfolioEntry[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(
    async (entry: NewPortfolioEntry): Promise<PortfolioEntry | null> => {
      try {
        const fileName = `${Date.now()}-${entry.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(ARTWORKS_BUCKET)
          .upload(filePath, entry.file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(ARTWORKS_BUCKET)
          .getPublicUrl(filePath);

        const { data, error: insertError } = await supabase
          .from("portfolio_entries")
          .insert({
            image_url: urlData.publicUrl,
            image_path: filePath,
            skill_level: entry.skillLevel,
            tokens_earned: entry.tokensEarned,
            feedback: entry.feedback,
            critique_pins: entry.critiquePins,
            medium: entry.medium,
            medium_match: entry.mediumMatch,
            is_analog: entry.isAnalog,
            experimentation_level: entry.experimentationLevel,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newEntry = data as PortfolioEntry;
        setEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save artwork to portfolio");
        return null;
      }
    },
    []
  );

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        await supabase.storage.from(ARTWORKS_BUCKET).remove([entry.image_path]);
      }
      const { error: deleteError } = await supabase
        .from("portfolio_entries")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete portfolio entry");
      return false;
    }
  }, [entries]);

  return { entries, loading, error, addEntry, deleteEntry, refetch: fetchEntries };
}
