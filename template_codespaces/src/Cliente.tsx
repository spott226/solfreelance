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

export default function Cliente({ onBack }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [amount, setAmount] = useState(0.1);
  const [loading, setLoading] = useState(false);

  const deposit = async () => {
    if (!publicKey) {
      alert("Conecta tu wallet");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Monto inválido");
      return;
    }

    try {
      setLoading(true);

      const lamports = Math.round(amount * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: ESCROW,
          lamports,
        })
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      alert(`Depósito exitoso: ${amount} SOL`);
    } catch (err) {
      console.error(err);
      alert("Error en la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Cliente</h1>

        <p style={styles.subtitle}>
          Deposita fondos en escrow de forma segura
        </p>

        <div style={{ marginBottom: 20 }}>
          <WalletMultiButton />
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          step="0.01"
          style={styles.input}
          placeholder="Monto en SOL"
        />

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={deposit}
          disabled={loading}
        >
          {loading ? "Procesando..." : `Depositar ${amount} SOL`}
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
    background: "linear-gradient(135deg, #0f0f0f, #1a1a2e)",
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
    marginBottom: "30px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    marginBottom: "15px",
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #9945FF, #14F195)",
    color: "#000",
    fontWeight: "bold",
    fontSize: "16px",
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
};