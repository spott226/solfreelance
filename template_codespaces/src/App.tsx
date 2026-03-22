import { useState } from "react";
import Cliente from "./Cliente";
import Freelancer from "./Freelancer";

export default function App() {
  const [view, setView] = useState<"home" | "cliente" | "freelancer">("home");

  if (view === "cliente") {
    return <Cliente onBack={() => setView("home")} />;
  }

  if (view === "freelancer") {
    return <Freelancer onBack={() => setView("home")} />;
  }

  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <div style={styles.nav}>
        <div style={styles.logo}>SolFreelance</div>
        <div style={styles.tag}>Escrow descentralizado</div>
      </div>

      {/* HERO */}
      <div style={styles.hero}>
        <h1 style={styles.title}>
          Contrata sin riesgo.<br />
          Cobra con garantía.
        </h1>

        <p style={styles.subtitle}>
          Pagos protegidos en smart contracts.
          Freelancers con compromiso real.
        </p>

        <div style={styles.actions}>
          <button
            style={styles.primary}
            onClick={() => setView("cliente")}
          >
            Soy Cliente
          </button>

          <button
            style={styles.secondary}
            onClick={() => setView("freelancer")}
          >
            Soy Freelancer
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        © 2026 SolFreelance — Built on Solana
      </div>
    </div>
  );
}

/* ================== STYLES ================== */

const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(135deg, #0a0a0a, #111)",
    color: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 40px",
    borderBottom: "1px solid #222",
  },

  logo: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  tag: {
    fontSize: 12,
    color: "#888",
  },

  hero: {
    textAlign: "center" as const,
    padding: "40px",
  },

  title: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 20,
    lineHeight: 1.2,
  },

  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 40,
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
  },

  primary: {
    padding: "14px 28px",
    background: "#14F195",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: 8,
  },

  secondary: {
    padding: "14px 28px",
    background: "transparent",
    border: "1px solid #444",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 8,
  },

  footer: {
    textAlign: "center" as const,
    padding: 20,
    fontSize: 12,
    color: "#666",
  },
};