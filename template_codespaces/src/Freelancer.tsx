import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

type Props = {
  onBack: () => void;
};

const ESCROW = new PublicKey("GS8hRTAX1bdBJhpHcqYgZVozYTyZt3EU9YEv34y9FRyB");

export default function Freelancer({ onBack }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const checkBalance = async () => {
    try {
      const bal = await connection.getBalance(ESCROW);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error(err);
      alert("Error al obtener balance");
    }
  };

  const withdraw = async () => {
    if (!publicKey) {
      alert("Conecta tu wallet");
      return;
    }

    try {
      setLoading(true);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: ESCROW,
          toPubkey: publicKey,
          lamports: Math.round(0.1 * LAMPORTS_PER_SOL),
        })
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      alert("Fondos retirados");
    } catch (err) {
      console.error(err);
      alert("No autorizado o error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Freelancer</h1>

        <p style={styles.subtitle}>
          Consulta y retira fondos del escrow
        </p>

        <div style={{ marginBottom: 20 }}>
          <WalletMultiButton />
        </div>

        <button style={styles.secondaryBtn} onClick={checkBalance}>
          Ver balance escrow
        </button>

        {balance !== null && (
          <p style={styles.balance}>{balance} SOL</p>
        )}

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={withdraw}
          disabled={loading}
        >
          {loading ? "Procesando..." : "Retirar fondos"}
        </button>

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

const styles: { [key: string]: any } = {
  container: {
    height: "100vh",
    background: "#050508",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "sans-serif",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "40px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },

  title: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#aaa",
    marginBottom: "20px",
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #14F195, #00FFA3)",
    color: "#000",
    fontWeight: "bold",
    fontSize: "16px",
    marginTop: "10px",
  },

  secondaryBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "transparent",
    color: "#aaa",
    cursor: "pointer",
    marginBottom: "10px",
  },

  backBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "transparent",
    color: "#aaa",
    cursor: "pointer",
    marginTop: "10px",
  },

  wallet: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#888",
  },

  balance: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#14F195",
  },
};