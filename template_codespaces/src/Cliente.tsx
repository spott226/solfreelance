import { useState, useEffect } from "react";
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

export default function Cliente({ onBack }: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);
  const [vaultAddress, setVaultAddress] = useState("");

  // 🔥 persistencia para demo
  useEffect(() => {
    const saved = localStorage.getItem("vault");
    if (saved) setVaultAddress(saved);
  }, []);

  const createProject = async () => {
    try {
      if (!wallet.publicKey) {
        alert("Conecta tu wallet");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        alert("Monto inválido");
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

      // 🔥 PDA ÚNICO para evitar colisiones
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vault"),
          wallet.publicKey.toBuffer(),
          new anchor.BN(Date.now()).toArrayLike(Buffer, "le", 8),
        ],
        PROGRAM_ID
      );

      const lamports =
        parseFloat(amount) * anchor.web3.LAMPORTS_PER_SOL;

      console.log("📦 Vault:", vaultPda.toBase58());

      const tx = await program.methods
        .createProject(new anchor.BN(lamports))
        .accounts({
          vault: vaultPda,
          client: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("TX:", tx);

      const vaultStr = vaultPda.toBase58();

      setVaultAddress(vaultStr);
      localStorage.setItem("vault", vaultStr);

      alert("✅ Proyecto creado");

    } catch (err) {
      console.error("❌ ERROR REAL:", err);
      alert("Error al crear");
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

      <div style={styles.main}>
        <div style={styles.card}>
          <h2>Publicar Proyecto</h2>

          <input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Monto en SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />

          <button onClick={createProject} style={styles.primary}>
            {loading ? "Creando..." : "Publicar Proyecto"}
          </button>
        </div>

        <div style={styles.card}>
          <h2>Proyecto Activo</h2>

          <p><b>Título:</b> {title || "-"}</p>
          <p><b>Descripción:</b> {description || "-"}</p>
          <p><b>Monto:</b> {amount} SOL</p>

          {vaultAddress && (
            <>
              <div style={styles.vaultBox}>
                <span>📦 Vault</span>
                <code>{vaultAddress}</code>
              </div>
            </>
          )}
        </div>
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
    fontSize: 18,
  },
  back: {
    background: "transparent",
    border: "1px solid #333",
    color: "#fff",
    padding: "8px 12px",
    cursor: "pointer",
  },
  main: {
    display: "flex",
    gap: 20,
    padding: 30,
  },
  card: {
    flex: 1,
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
  vaultBox: {
    marginTop: 20,
    padding: 10,
    background: "#000",
    border: "1px solid #333",
    fontSize: 12,
  },
};