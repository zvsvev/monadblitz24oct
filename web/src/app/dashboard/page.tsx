import { Dashboard } from "@/components/dashboard";
import { GachaPanel } from "@/components/gacha-panel";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-extrabold text-eel">Profile</h1>
      <Dashboard />
      <section id="gacha" className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-eel">Daily gacha</h2>
        <GachaPanel />
      </section>
    </div>
  );
}
