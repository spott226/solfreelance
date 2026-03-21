import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { useState } from "react";

/* ================= PROPS ================= */
type Props = {
  onBack: () => void;
};

/* ================= ESCROW ================= */
const ESCROW = new PublicKey("GS8hRTAX1bdBJhpHcqYgZVozYTyZt3EU9YEv34y9FRyB");

/* ================= COMPONENT ================= */
export default function Cliente({ onBack }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const deposit = async () => {
    if (!publicKey) return setStatus("Conecta tu wallet");

    setLoading(true);
    setStatus("Enviando transacción...");

    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: ESCROW,
          lamports: 0.1 * LAMPORTS_PER_SOL,
        })
      );

      const sig = await sendTransaction(tx, connection);
      setStatus("Confirmando en red...");

      await connection.confirmTransaction(sig);

      setStatus("Depósito confirmado ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error en la transacción ❌");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.glow}></div>

      <div style={styles.card}>
        <h1 style={styles.title}>Escrow Cliente</h1>

        <p style={styles.subtitle}>
          Protege tu pago hasta que el trabajo se complete
        </p>

        <div style={{ marginBottom: 20 }}>
          <WalletMultiButton />
        </div>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={deposit}
          disabled={loading}
        >
          {loading ? "Procesando..." : "Depositar 0.1 SOL"}
        </button>

        {status && <p style={styles.status}>{status}</p>}

        {publicKey && (
          <p style={styles.wallet}>
            {publicKey.toString().slice(0, 4)}...
            {publicKey.toString().slice(-4)}
          </p>
        )}

        <button style={styles.backBtn} onClick={onBack}>
          ← Volver
        </button>
      </div>
    </div>
  );
}

/* ================= ESTILOS ================= */

const styles = {
  container: {
    height: "100vh",
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    overflow: "hidden" as const,
    color: "#fff",
    fontFamily: "sans-serif",
  },

  glow: {
    position: "absolute" as const,
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, #9945FF55, transparent)",
    filter: "blur(100px)",
  },

  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "40px",
    width: "340px",
    textAlign: "center" as const,
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
  },

  title: {
    fontSize: "26px",
    marginBottom: "10px",
    letterSpacing: "0.5px",
  },

  subtitle: {
    fontSize: "13px",
    color: "#999",
    marginBottom: "30px",
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #9945FF, #14F195)",
    color: "#000",
    fontWeight: "600",
    fontSize: "15px",
    transition: "0.2s",
  },

  backBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    marginTop: "12px",
  },

  status: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#aaa",
  },

  wallet: {
    marginTop: "20px",
    fontSize: "11px",
    color: "#666",
  },
};