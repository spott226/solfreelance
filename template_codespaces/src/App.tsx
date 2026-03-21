import { useState } from "react";
import Cliente from "./Cliente";
import Freelancer from "./Freelancer";

export default function App() {
  const [view, setView] = useState<"home" | "cliente" | "freelancer">("home");

  if (view === "cliente") return <Cliente />;
  if (view === "freelancer") return <Freelancer />;

  return (
    <div style={{ padding: 40 }}>
      <h1>SolFreelance</h1>

      <button onClick={() => setView("cliente")}>
        Entrar como Cliente
      </button>

      <button onClick={() => setView("freelancer")}>
        Entrar como Freelancer
      </button>
    </div>
  );
}