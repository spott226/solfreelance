import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Buffer } from "buffer";

type Props = {
  onBack: () => void;
};

const PROGRAM_ID = new PublicKey(
  "4ZQboCKFb5sJHkzNhQ48VTmo2Zt2zTaJWuMw2aENuo66"
);

export default function Freelancer({ onBack }: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [clientInput, setClientInput] = useState("");
  const [vaultAddress, setVaultAddress] = useState("");
  const [commitment, setCommitment] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "sent">("idle");

  useEffect(() => {
    const savedVault = localStorage.getItem("vault");
    if (savedVault) setVaultAddress(savedVault);
  }, []);

  const applyToProject = async () => {
    try {
      if (!wallet.publicKey) return alert("Conecta wallet");

      let vaultToUse = vaultAddress;

      if (!vaultToUse) {
        const savedVault = localStorage.getItem("vault");
        if (savedVault) {
          setVaultAddress(savedVault);
          vaultToUse = savedVault;
        }
      }

      if (!vaultToUse) return alert("Pega el vault del proyecto");
      if (!commitment || isNaN(Number(commitment)))
        return alert("Monto inválido");

      setLoading(true);
      setStatus("pending");

      const vault = new PublicKey(vaultToUse);
      const lamports = parseFloat(commitment) * LAMPORTS_PER_SOL;

      const discriminator = Buffer.from(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode("global:apply")
        )
      ).slice(0, 8);

      const buffer = Buffer.alloc(16);
      buffer.set(discriminator, 0);
      buffer.writeBigUInt64LE(BigInt(lamports), 8);

      const tx = new Transaction().add({
        keys: [
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: buffer,
      });

      const sig = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);

      setStatus("sent");
      alert("Compromiso enviado 🚀");
    } catch (err) {
      console.error(err);
      alert("Error al aplicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Confirmar compromiso como freelancer</h2>

        <p style={styles.message}>
          Para asegurar el proyecto, debes depositar una garantía que confirma tu
          compromiso.
        </p>

        <p style={styles.submessage}>
          Tu depósito asegura que el proyecto es serio para ambas partes.
        </p>

        <WalletMultiButton />

        <div style={styles.section}>
          <label style={styles.label}>Proyecto seleccionado</label>
          <input
            placeholder="Dirección del proyecto"
            value={vaultAddress}
            onChange={(e) => setVaultAddress(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Depósito de compromiso (SOL)</label>
          <input
            placeholder="Ej: 0.5"
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.statusBox}>
          <p style={styles.statusTitle}>Estado del freelancer</p>
          <p style={styles.statusText}>
            {status === "idle" && "Esperando confirmación"}
            {status === "pending" && "Enviando compromiso..."}
            {status === "sent" && "Freelancer confirmado"}
          </p>
          <p style={styles.escrow}>Escrow activo</p>
        </div>

        <button
          onClick={applyToProject}
          style={styles.primary}
          disabled={loading}
        >
          Confirmar compromiso
        </button>

        <button style={styles.back} onClick={onBack}>
          ← Regresar
        </button>

        <div style={styles.info}>
          <p>Wallet: {wallet.publicKey?.toBase58()}</p>
          <p style={{ opacity: 0.4, fontSize: 10 }}>
            Ref: {vaultAddress}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0a0a0a",
    color: "#fff",
  },
  card: {
    width: 380,
    padding: 28,
    background: "#111",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
    border: "1px solid #1f1f1f",
  },
  title: {
    margin: 0,
    fontSize: 20,
  },
  message: {
    fontSize: 14,
    color: "#ccc",
  },
  submessage: {
    fontSize: 12,
    color: "#888",
  },
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: "#aaa",
  },
  input: {
    padding: 12,
    background: "#000",
    border: "1px solid #222",
    borderRadius: 8,
    color: "#fff",
  },
  primary: {
    padding: 14,
    background: "#14F195",
    border: "none",
    color: "#000",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: 10,
  },
  back: {
    background: "transparent",
    border: "1px solid #333",
    color: "#fff",
    padding: 10,
    cursor: "pointer",
    borderRadius: 8,
  },
  statusBox: {
    background: "#0d0d0d",
    border: "1px solid #1f1f1f",
    padding: 12,
    borderRadius: 10,
  },
  statusTitle: {
    fontSize: 12,
    color: "#888",
    margin: 0,
  },
  statusText: {
    fontSize: 14,
    color: "#14F195",
    margin: "4px 0",
  },
  escrow: {
    fontSize: 11,
    color: "#666",
  },
  info: {
    fontSize: 11,
    color: "#666",
    wordBreak: "break-all" as const,
  },
};