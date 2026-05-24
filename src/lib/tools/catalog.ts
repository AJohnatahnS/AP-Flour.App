import type { AppDictionary } from "@/lib/i18n/dictionaries";

export type ToolId = "dice" | "wheel" | "picker" | "score" | "timer";

export type ToolCatalogItem = {
  id: ToolId;
  name: string;
  description: string;
  action: string;
  tone: string;
};

export const toolCatalog: ToolCatalogItem[] = [
  {
    id: "dice",
    name: "Dice",
    description: "Roll D4-D20 sets with totals, modifiers, and quick history.",
    action: "Open dice",
    tone: "border-l-primary",
  },
  {
    id: "wheel",
    name: "Wheel",
    description: "Spin a weighted list, assign colors, and remove winners.",
    action: "Open wheel",
    tone: "border-l-accent",
  },
  {
    id: "picker",
    name: "Picker",
    description: "Pick from the same saved lists without the wheel animation.",
    action: "Open picker",
    tone: "border-l-sky-600",
  },
  {
    id: "score",
    name: "Score",
    description: "Track players or teams with +1, -1, +5, and -5 controls.",
    action: "Open score",
    tone: "border-l-emerald-600",
  },
  {
    id: "timer",
    name: "Timer",
    description: "Countdowns and stopwatch for foreground play sessions.",
    action: "Open timer",
    tone: "border-l-amber-600",
  },
];

export function getLocalizedToolCatalog(copy: AppDictionary): ToolCatalogItem[] {
  return toolCatalog.map((tool) => ({
    ...tool,
    action: copy.tools[tool.id].action,
    description: copy.tools[tool.id].description,
    name: copy.tools[tool.id].name,
  }));
}
