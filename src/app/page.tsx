import AmbientBackground from "@/components/AmbientBackground/AmbientBackground";
import MainMenu from "@/components/MainMenu/MainMenu";
import MouseGlow from "@/components/MouseGlow/MouseGlow";

export default function Home() {
  return (
    <main className="relative min-h-screen max-md:h-screen max-md:overflow-hidden">
      <AmbientBackground />
      <MouseGlow />
      <MainMenu />
    </main>
  );
}
