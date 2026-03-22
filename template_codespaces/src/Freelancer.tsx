import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

import idlJson from "./idl/vault.json";

const idl = idlJson as anchor.Idl;

type Props = {
  onBack: () => void;
};

export default function Freelancer({ onBack }: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [vaultInput, setVaultInput] = useState("");
  const [commitment, setCommitment] = useState("0.005");
  const [loading, setLoading] = useState(false);

  // lista local de proyectos (para demo)
  const [projects, setProjects] = useState<string[]>([]);

  const addProject = () => {
    if (!vaultInput) return;
    if (!isValidPubkey(vaultInput)) {
      alert("Vault inválido");
      return;
    }
    if (projects.includes(vaultInput)) return;

    setProjects([vaultInput, ...projects]);
    setVaultInput("");
  };

  const applyToProject = async (vaultAddress: string) => {
    try {
      if (!wallet.publicKey) {
        alert("Conecta tu wallet");
        return;
      }

      if (!commitment || Number(commitment) <= 0) {
        alert("Compromiso inválido");
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

      const program = new anchor.Program(idl, provider);

      const vault = new PublicKey(vaultAddress);

      const lamports =
        parseFloat(commitment) * anchor.web3.LAMPORTS_PER_SOL;

      console.log("👤 Freelancer:", wallet.publicKey.toBase58());
      console.log("📦 Vault:", vault.toBase58());
      console.log("💰 Commitment (lamports):", lamports);

      const tx = await program.methods
        .apply(new anchor.BN(lamports))
        .accounts({
          vault,
          freelancer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("TX APPLY:", tx);
      alert("✅ Aplicaste al proyecto");
    } catch (err) {
      console.error("❌ ERROR APPLY:", err);
      alert("Error al aplicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* NAV */}
      <div style={styles.nav}>
        <button onClick={onBack} style={styles.back}>
          ← Volver
        </button>

        <div style={styles.logo}>SolFreelance</div>

        <WalletMultiButton />
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* LEFT: BUSCADOR */}
        <div style={styles.card}>
          <h2>Explorar Proyectos</h2>

          <input
            placeholder="Pega el Vault del proyecto"
            value={vaultInput}
            onChange={(e) => setVaultInput(e.target.value)}
            style={styles.input}
          />

          <button onClick={addProject} style={styles.primary}>
            Agregar Proyecto
          </button>

          <input
            placeholder="Compromiso (SOL)"
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            style={styles.input}
          />

          <p style={styles.hint}>
            Depósito reembolsable. Demuestra compromiso.
          </p>
        </div>

        {/* RIGHT: LISTA */}
        <div style={styles.card}>
          <h2>Disponibles</h2>

          {projects.length === 0 && (
            <p style={{ color: "#777" }}>
              No hay proyectos. Pega un vault para probar.
            </p>
          )}

          {projects.map((vault, i) => (
            <div key={i} style={styles.project}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ color: "#888" }}>Vault</span>
                <code style={styles.code}>{vault}</code>
              </div>

              <button
                onClick={() => applyToProject(vault)}
                style={styles.primary}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Aplicar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== utils ========== */

function isValidPubkey(v: string) {
  try {
    new PublicKey(v);
    return true;
  } catch {
    return false;
  }
}

/* ========== styles ========== */

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
    marginTop: 12,
    background: "#14F195",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },

  project: {
    border: "1px solid #333",
    borderRadius: 10,
    padding: 15,
    marginTop: 12,
    background: "#0d0d0d",
  },

  code: {
    display: "block",
    marginTop: 5,
    fontSize: 12,
    background: "#000",
    padding: 8,
    border: "1px solid #333",
    wordBreak: "break-all" as const,
  },

  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#888",
  },
};