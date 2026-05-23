export type Locale = "en" | "th";

export const defaultLocale: Locale = "en";

export const dictionaries = {
  en: {
    appName: "AP Flour",
    tagline: "All-purpose play tools",
    settings: "Settings",
    savedPresets: "Saved presets",
    presetsDescription: "Presets will stay on this device after you explicitly save them.",
    noPresets: "No presets yet",
  },
  th: {
    appName: "AP Flour",
    tagline: "เครื่องมืออเนกประสงค์สำหรับเล่นกับเพื่อน",
    settings: "ตั้งค่า",
    savedPresets: "พรีเซ็ตที่บันทึกไว้",
    presetsDescription: "พรีเซ็ตจะอยู่ในเครื่องนี้หลังจากคุณกดบันทึกเอง",
    noPresets: "ยังไม่มีพรีเซ็ต",
  },
} satisfies Record<Locale, Record<string, string>>;
