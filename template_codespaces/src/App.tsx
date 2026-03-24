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
          Pagos protegidos en contratos inteligentes en Solana.
        </p>

        <div style={styles.actions}>
          <button
            style={styles.primary}
            onClick={() => setView("cliente")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(20,241,149,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Soy Cliente
          </button>

          <button
            style={styles.secondary}
            onClick={() => setView("freelancer")}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#14F195";
              e.currentTarget.style.color = "#14F195";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#444";
              e.currentTarget.style.color = "#fff";
            }}
          >
            Soy Freelancer
          </button>
        </div>

        {/* TRUST INDICATORS */}
        <div style={styles.trustRow}>
          <div style={styles.trustItem}>🔒 Fondos protegidos en contrato</div>
          <div style={styles.trustItem}>⚡ Sin intermediarios</div>
          <div style={styles.trustItem}>🤝 Compromiso bilateral</div>
        </div>
      </div>

      {/* FLOW SECTION */}
      <div style={styles.flowSection}>
        <div style={styles.flowTitle}>Cómo funciona</div>

        <div style={styles.flowGrid}>
          <div style={styles.card}>
            <div style={styles.step}>1</div>
            <div style={styles.cardTitle}>Cliente deposita</div>
            <div style={styles.cardText}>
              El pago queda bloqueado en un smart contract seguro.
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.step}>2</div>
            <div style={styles.cardTitle}>Freelancer se compromete</div>
            <div style={styles.cardText}>
              El trabajo inicia solo cuando el pago está garantizado.
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.step}>3</div>
            <div style={styles.cardTitle}>Pago liberado automáticamente</div>
            <div style={styles.cardText}>
              El dinero se libera automáticamente al cumplirse el acuerdo.
            </div>
          </div>
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
    minHeight: "100vh",
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
    padding: "60px 20px 40px",
    maxWidth: 900,
    margin: "0 auto",
  },

  title: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 20,
    lineHeight: 1.2,
  },

  subtitle: {
    fontSize: 18,
    color: "#aaa",
    marginBottom: 30,
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
  },

  primary: {
    padding: "14px 28px",
    background: "#14F195",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: 10,
    transition: "all 0.2s ease",
  },

  secondary: {
    padding: "14px 28px",
    background: "transparent",
    border: "1px solid #444",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 10,
    transition: "all 0.2s ease",
  },

  trustRow: {
    display: "flex",
    justifyContent: "center",
    gap: 30,
    marginTop: 20,
    flexWrap: "wrap" as const,
    fontSize: 13,
    color: "#888",
  },

  trustItem: {
    opacity: 0.9,
  },

  flowSection: {
    padding: "40px 20px 60px",
    borderTop: "1px solid #111",
  },

  flowTitle: {
    textAlign: "center" as const,
    fontSize: 20,
    marginBottom: 30,
    color: "#ccc",
    letterSpacing: 1,
  },

  flowGrid: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap" as const,
  },

  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "20px",
    width: 260,
    textAlign: "center" as const,
    transition: "all 0.2s ease",
  },

  step: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#14F195",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    margin: "0 auto 10px",
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  cardText: {
    fontSize: 13,
    color: "#888",
  },

  footer: {
    textAlign: "center" as const,
    padding: 20,
    fontSize: 12,
    color: "#666",
  },
};