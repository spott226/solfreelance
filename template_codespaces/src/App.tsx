import { useState } from "react";
import Cliente from "./Cliente";
import Freelancer from "./Freelancer";

export default function App() {
  const [view, setView] = useState("home");

  if (view === "cliente") return <Cliente />;
  if (view === "freelancer") return <Freelancer />;

  return (
    <div style={styles.container}>
      <div style={styles.glow}></div>

      <div style={styles.card}>
        <h1 style={styles.title}>SolFreelance</h1>
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

        <p style={styles.footer}>
          Sin intermediarios · Transparente · Rápido ⚡
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    color: "#fff",
    fontFamily: "sans-serif",
  },

  glow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, #14F19533, transparent)",
    filter: "blur(120px)",
  },

  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "50px 40px",
    width: "360px",
    textAlign: "center",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
  },

  title: {
    fontSize: "30px",
    marginBottom: "10px",
    letterSpacing: "1px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#aaa",
    marginBottom: "35px",
  },

  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  primaryBtn: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #9945FF, #14F195)",
    color: "#000",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    fontWeight: "500",
    fontSize: "15px",
    cursor: "pointer",
  },

  footer: {
    marginTop: "30px",
    fontSize: "12px",
    color: "#666",
  },
};