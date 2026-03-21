import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from "@solana/web3.js";
import { useState } from "react";

export default function VaultCard() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // wallet dummy vault
  const VAULT = new PublicKey("GS8hRTAX1bdBJhpHcqYgZVozYTyZt3EU9YEv34y9FRyB");

  const deposit = async () => {
    try {
      if (!publicKey) return alert("Conecta wallet");

      const value = parseFloat(amount);
      if (!value || value <= 0) return alert("Cantidad inválida");

      setLoading(true);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: VAULT,
          lamports: value * LAMPORTS_PER_SOL,
        })
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);

      alert("Depositado al vault");
      setAmount("");
    } catch (e) {
      console.error(e);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Vault</h3>

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="SOL"
      />

      <button onClick={deposit} disabled={loading}>
        {loading ? "..." : "Depositar"}
      </button>
    </div>
  );
}