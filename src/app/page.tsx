import { loadState } from "@/lib/state";
import { getInputDir } from "@/lib/server-config";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const inputDir = getInputDir();
  const state = await loadState();
  return (
    <main className="min-h-screen">
      <Dashboard initialState={state} inputDir={inputDir} />
    </main>
  );
}
