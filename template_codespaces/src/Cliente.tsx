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

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: ESCROW,
        lamports: 0.1 * LAMPORTS_PER_SOL,
      })
    );

    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig);

    alert("Fondos enviados al escrow");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Cliente</h2>
      <WalletMultiButton />

      <button onClick={deposit}>
        Depositar 0.1 SOL
      </button>
    </div>
  );
}