import { Dashboard } from "@/components/dashboard";
import { GachaPanel } from "@/components/gacha-panel";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-eel">Your profile</h1>
        <p className="mt-1 text-sm font-bold text-wolf">
          Your listings, your spend, your daily gacha, and anything you have won.
        </p>
      </div>

      <Dashboard />

      <section id="gacha" className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-eel">Daily gacha</h2>
        <GachaPanel />
      </section>
    </div>
  );
}
