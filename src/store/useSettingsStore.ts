import { create } from "zustand";
import { Settings, SettingsSchema } from "../lib/schema/progress";
import { defaultRepository } from "../lib/storage/repository";

interface SettingsState {
  settings: Settings;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: SettingsSchema.parse({}),
  isLoaded: false,

  loadSettings: async () => {
    const loaded = await defaultRepository.getSettings();
    set({ settings: loaded, isLoaded: true });
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    const updated = SettingsSchema.parse({ ...current, ...partial });
    await defaultRepository.saveSettings(updated);
    set({ settings: updated });
  },
}));
