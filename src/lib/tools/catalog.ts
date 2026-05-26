import type { AppDictionary } from "@/lib/i18n/dictionaries";

export type ToolId = "dice" | "wheel" | "picker" | "cards" | "score" | "timer";

export type ToolCatalogItem = {
  id: ToolId;
  name: string;
  description: string;
  action: string;
  href: `/${ToolId}`;
  icon: ToolId;
  surfaceClass: string;
  iconClass: string;
};

export const toolCatalog: ToolCatalogItem[] = [
  {
    id: "dice",
    name: "Dice",
    description: "Roll D4-D20 sets with totals, modifiers, and quick history.",
    action: "Open dice",
    href: "/dice",
    icon: "dice",
    surfaceClass: "tool-card-dice",
    iconClass: "tool-icon-dice",
  },
  {
    id: "wheel",
    name: "Wheel",
    description: "Spin a weighted list, assign colors, and remove winners.",
    action: "Open wheel",
    href: "/wheel",
    icon: "wheel",
    surfaceClass: "tool-card-wheel",
    iconClass: "tool-icon-wheel",
  },
  {
    id: "picker",
    name: "Picker",
    description: "Pick from the same saved lists without the wheel animation.",
    action: "Open picker",
    href: "/picker",
    icon: "picker",
    surfaceClass: "tool-card-picker",
    iconClass: "tool-icon-picker",
  },
  {
    id: "cards",
    name: "Cards",
    description: "Shuffle a standard deck and draw cards without repeats.",
    action: "Open cards",
    href: "/cards",
    icon: "cards",
    surfaceClass: "tool-card-cards",
    iconClass: "tool-icon-cards",
  },
  {
    id: "score",
    name: "Score",
    description: "Track players or teams with +1, -1, +5, and -5 controls.",
    action: "Open score",
    href: "/score",
    icon: "score",
    surfaceClass: "tool-card-score",
    iconClass: "tool-icon-score",
  },
  {
    id: "timer",
    name: "Timer",
    description: "Countdowns and stopwatch for foreground play sessions.",
    action: "Open timer",
    href: "/timer",
    icon: "timer",
    surfaceClass: "tool-card-timer",
    iconClass: "tool-icon-timer",
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
