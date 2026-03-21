import React, { useState } from "react";
import Cliente from "./Cliente";
import Freelancer from "./Freelancer";

type View = "home" | "cliente" | "freelancer";

export default function App() {
  const [view, setView] = useState<View>("home");

  if (view === "cliente") {
    return <Cliente onBack={() => setView("home")} />;
  }

  if (view === "freelancer") {
    return <Freelancer onBack={() => setView("home")} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.glow}></div>

      <div style={styles.card}>
        <h1 style={styles.title}>🚀 SolFreelance</h1>

        <p style={styles.subtitle}>
          Pagos seguros con escrow en Solana
        </p>

        <div style={styles.buttons}>
          <button
            style={styles.primaryBtn}
            onClick={() => setView("cliente")}
          >
            Soy Cliente
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => setView("freelancer")}
          >
            Soy Freelancer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= ESTILOS ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #0f172a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, #6366f1, transparent)",
    filter: "blur(120px)",
    opacity: 0.3,
  },

  card: {
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid #334155",
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    width: "350px",
    zIndex: 2,
  },

  title: {
    fontSize: "28px",
    color: "#ffffff",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "30px",
    fontSize: "14px",
  },

  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  primaryBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#3b82f6",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },

  secondaryBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#8b5cf6",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },
};