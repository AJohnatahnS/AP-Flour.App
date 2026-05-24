import { AppHeader } from "@/features/layout/app-header";
import { PickerTool } from "@/features/picker/picker-tool";

export default function PickerPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader />
        <PickerTool />
      </div>
    </main>
  );
}
