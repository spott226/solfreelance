import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

import idlJson from "./idl/vault.json";

const PROGRAM_ID = new PublicKey(
  "4ZQboCKFb5sJHkzNhQ48VTmo2Zt2zTaJWuMw2aENuo66"
);

const idl = idlJson as anchor.Idl;

type Props = {
  onBack: () => void;
};

export default function Freelancer({ onBack }: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [clientInput, setClientInput] = useState("");
  const [commitment, setCommitment] = useState("0.005");
  const [loading, setLoading] = useState(false);

  const applyToProject = async () => {
    try {
      if (!wallet.publicKey) {
        alert("Conecta tu wallet");
        return;
      }

      if (!clientInput) {
        alert("Pega wallet del cliente");
        return;
      }

      setLoading(true);

      const provider = new anchor.AnchorProvider(
        connection,
        wallet as any,
        {
          preflightCommitment: "processed",
          commitment: "processed",
        }
      );

      anchor.setProvider(provider);

      const program = new anchor.Program(
        idl,
        PROGRAM_ID,
        provider
      );

      // 🔥 aquí se calcula el vault correcto
      const clientPubkey = new PublicKey(clientInput);

      const [vault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), clientPubkey.toBuffer()],
        PROGRAM_ID
      );

      const lamports =
        parseFloat(commitment) * anchor.web3.LAMPORTS_PER_SOL;

      console.log("Cliente:", clientPubkey.toBase58());
      console.log("Vault calculado:", vault.toBase58());

      const tx = await program.methods
        .apply(new anchor.BN(lamports))
        .accounts({
          vault,
          freelancer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("TX APPLY:", tx);

      alert("✅ Aplicaste correctamente");

    } catch (err) {
      console.error("❌ ERROR:", err);
      alert("Error al aplicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <button onClick={onBack} style={styles.back}>
          ← Volver
        </button>

        <div style={styles.logo}>SolFreelance</div>

        <WalletMultiButton />
      </div>

      <div style={styles.card}>
        <h2>Aplicar a Proyecto</h2>

        <input
          placeholder="Wallet del cliente"
          value={clientInput}
          onChange={(e) => setClientInput(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Compromiso (SOL)"
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={applyToProject}
          style={styles.primary}
          disabled={loading}
        >
          {loading ? "Procesando..." : "Aplicar"}
        </button>
      </div>
    </div>
  );
}

/* estilos */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 30px",
    borderBottom: "1px solid #222",
    alignItems: "center",
  },
  logo: {
    fontWeight: "bold",
  },
  back: {
    background: "transparent",
    border: "1px solid #333",
    color: "#fff",
    padding: "8px 12px",
    cursor: "pointer",
  },
  card: {
    maxWidth: 500,
    margin: "50px auto",
    background: "#111",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #222",
  },
  input: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#0a0a0a",
    border: "1px solid #333",
    color: "#fff",
  },
  primary: {
    width: "100%",
    padding: 14,
    marginTop: 15,
    background: "#14F195",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
};