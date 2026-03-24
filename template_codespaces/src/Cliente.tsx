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

export default function Cliente({ onBack }: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [amount, setAmount] = useState("");
  const [vaultAddress, setVaultAddress] = useState("");
  const [vault, setVault] = useState("");
  const [freelancerInput, setFreelancerInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedVault = localStorage.getItem("vault");
    if (savedVault) {
      setVault(savedVault);
    }
  }, []);

  const createProject = async () => {
    try {
      if (!wallet.publicKey) return alert("Conecta wallet");
      if (!amount || isNaN(Number(amount)))
        return alert("Monto inválido");

      setLoading(true);

      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const timestamp = Math.floor(Date.now() / 1000);

      const seed = [
        Buffer.from("vault"),
        wallet.publicKey.toBuffer(),
        Buffer.from(
          new Uint8Array(
            new BigInt64Array([BigInt(timestamp)]).buffer
          )
        ),
      ];

      const [vaultPDA] = PublicKey.findProgramAddressSync(
        seed,
        PROGRAM_ID
      );

      localStorage.setItem("vault", vaultPDA.toBase58());
      setVault(vaultPDA.toBase58());
      console.log("VAULT:", vaultPDA.toBase58());

      const discriminator = Buffer.from([148,219,181,42,221,114,145,190]);

      const buffer = Buffer.alloc(24);
      buffer.set(discriminator, 0);
      buffer.writeBigUInt64LE(BigInt(lamports), 8);
      buffer.writeBigInt64LE(BigInt(timestamp), 16);

      const tx = new Transaction().add({
        keys: [
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: buffer,
      });

      const sig = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);

      setVaultAddress(vaultPDA.toBase58());

      alert("Proyecto creado 🚀");
    } catch (err) {
      console.error(err);
      alert("Error al crear proyecto");
    } finally {
      setLoading(false);
    }
  };

  const selectFreelancer = async () => {
    try {
      if (!wallet.publicKey) return alert("Conecta wallet");
      if (!vault) return alert("Vault requerido");
      if (!freelancerInput)
        return alert("Freelancer requerido");

      const cleanFreelancer = freelancerInput.trim().replace(/\s/g, "");

      const vaultPDA = new PublicKey(vault);
      const freelancerPubkey = new PublicKey(cleanFreelancer);

      const discriminator = Buffer.from([206,86,40,44,162,158,242,50]);

      const tx = new Transaction().add({
        keys: [
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: freelancerPubkey, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: discriminator,
      });

      const sig = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);

      alert("Freelancer seleccionado ✅");
    } catch (err) {
      console.error(err);
      alert("Error al seleccionar freelancer");
    }
  };

  const release = async () => {
    try {
      if (!wallet.publicKey) return alert("Conecta wallet");
      if (!vault) return alert("Vault requerido");
      if (!freelancerInput)
        return alert("Freelancer requerido");

      console.log("🔥 VAULT:", vault);
      console.log("🔥 FREELANCER:", freelancerInput);
      console.log("🔥 WALLET:", wallet.publicKey.toBase58());

      const vaultPDA = new PublicKey(vault);
      const freelancerPubkey = new PublicKey(freelancerInput);

      const discriminator = Buffer.from([253,249,15,206,28,127,193,241]);

      const tx = new Transaction().add({
        keys: [
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: freelancerPubkey, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: discriminator,
      });

      const sig = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);

      alert("Pago liberado 💸");
    } catch (err) {
      console.error(err);
      alert("Error al liberar pago");
    }
  };

  const projectCreated = !!vaultAddress;
  const freelancerSelected = !!freelancerInput && !!vaultAddress;
  const readyToRelease = projectCreated && freelancerSelected;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* LEFT */}
        <div style={styles.card}>
          <h2>Panel del Cliente</h2>

          <WalletMultiButton />

          <label style={styles.label}>Monto del proyecto (SOL)</label>
          <input
            style={styles.input}
            placeholder="Ej: 1.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button style={styles.primary} onClick={createProject}>
            Crear proyecto
          </button>

          <label style={styles.label}>Freelancer seleccionado</label>
          <input
            style={styles.input}
            placeholder="Freelancer seleccionado"
            value={freelancerInput}
            onChange={(e) => setFreelancerInput(e.target.value)}
          />

          <button style={styles.primary} onClick={selectFreelancer}>
            Seleccionar freelancer
          </button>

          <button style={styles.secondary} onClick={release}>
            Liberar pago
          </button>

          <button style={styles.back} onClick={onBack}>
            ← Regresar
          </button>
        </div>

        {/* RIGHT */}
        <div style={styles.card}>
          <h3>Estado del proyecto</h3>

          <div style={styles.statusItem}>
            <span style={styles.badge(projectCreated)}>Proyecto creado</span>
            {projectCreated && <p>Escrow creado correctamente</p>}
          </div>

          <div style={styles.statusItem}>
            <span style={styles.badge(projectCreated)}>
              Fondos bloqueados
            </span>
            {projectCreated && <p>Fondos seguros en contrato</p>}
          </div>

          <div style={styles.statusItem}>
            <span style={styles.badge(freelancerSelected)}>
              Freelancer seleccionado
            </span>
            {!freelancerSelected && <p>Freelancer no seleccionado aún</p>}
          </div>

          <div style={styles.statusItem}>
            <span style={styles.badge(readyToRelease)}>
              Listo para liberar pago
            </span>
            {readyToRelease && <p>Puedes completar el proyecto</p>}
          </div>

          <div style={styles.divider} />

          <h4>Freelancers disponibles</h4>
          <div style={styles.freelancer}>
            <span>🧑‍💻 Freelancer A</span>
          </div>
          <div style={styles.freelancer}>
            <span>🧑‍💻 Freelancer B</span>
          </div>

          <div style={styles.info}>
            <p>Wallet: {wallet.publicKey?.toBase58()}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {
    display: "flex",
    gap: 20,
  },
  card: {
    width: 360,
    padding: 20,
    background: "#111",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid #222",
  },
  label: {
    fontSize: 12,
    color: "#aaa",
  },
  input: {
    padding: 12,
    background: "#000",
    border: "1px solid #333",
    color: "#fff",
    borderRadius: 8,
  },
  primary: {
    padding: 12,
    background: "#14F195",
    border: "none",
    cursor: "pointer",
    borderRadius: 8,
    fontWeight: "bold",
  },
  secondary: {
    padding: 12,
    background: "#6366f1",
    border: "none",
    cursor: "pointer",
    borderRadius: 8,
  },
  back: {
    padding: 10,
    background: "transparent",
    border: "1px solid #444",
    color: "#fff",
    borderRadius: 8,
  },
  statusItem: {
    padding: 10,
    background: "#0d0d0d",
    borderRadius: 8,
    border: "1px solid #222",
  },
  badge: (active: boolean) => ({
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    background: active ? "#14F195" : "#333",
    color: active ? "#000" : "#aaa",
  }),
  divider: {
    height: 1,
    background: "#222",
    margin: "10px 0",
  },
  freelancer: {
    padding: 10,
    background: "#0d0d0d",
    borderRadius: 8,
    border: "1px solid #222",
  },
  info: {
    fontSize: 11,
    color: "#777",
    wordBreak: "break-all",
  },
};