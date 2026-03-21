import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

const ESCROW = new PublicKey("GS8hRTAX1bdBJhpHcqYgZVozYTyZt3EU9YEv34y9FRyB");

export default function Cliente() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const deposit = async () => {
    if (!publicKey) return alert("Conecta wallet");

    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: ESCROW,
          lamports: 0.1 * LAMPORTS_PER_SOL,
        })
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);

      alert("Depósito exitoso 🚀");
    } catch (err) {
      console.error(err);
      alert("Error en la transacción");
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

        <button style={styles.button} onClick={deposit}>
          Depositar 0.1 SOL
        </button>

        {publicKey && (
          <p style={styles.wallet}>
            Wallet: {publicKey.toString().slice(0, 4)}...
            {publicKey.toString().slice(-4)}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
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

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #9945FF, #14F195)",
    color: "#000",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.2s",
  },

  wallet: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#888",
  },
};