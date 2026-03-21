import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Freelancer() {
  const { publicKey } = useWallet();

  return (
    <div style={{ padding: 40 }}>
      <h2>Freelancer</h2>
      <WalletMultiButton />

      <p>
        Wallet conectada: {publicKey?.toBase58()}
      </p>

      <button onClick={() => alert("Trabajo aceptado")}>
        Aceptar trabajo
      </button>
    </div>
  );
}