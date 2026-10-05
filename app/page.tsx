import AurelLanding from "@/components/AurelLanding";

export const metadata = {
  title: "AUREL | The Machine",
  description:
    "AUREL is a premium automotive experience featuring a cinematic Mercedes SLS showcase, brutalist architecture, and immersive performance storytelling.",
  openGraph: {
    title: "AUREL | The Machine",
    description:
      "A premium cinematic automotive experience with a detailed 3D Mercedes SLS showcase.",
    type: "website",
  },
};

export default function Home() {
  return <AurelLanding />;
}
