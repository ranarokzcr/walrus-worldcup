import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";

const keypair = new Ed25519Keypair();
const address = keypair.getPublicKey().toSuiAddress();
const secret = keypair.getSecretKey(); // format: suiprivkey1...

console.log("\n===== SESSION WALLET =====");
console.log("Address    :", address);
console.log("Secret key :", secret);
console.log("==========================\n");

try {
  await requestSuiFromFaucetV2({ host: getFaucetHost("testnet"), recipient: address });
  console.log("Requested testnet SUI for gas. Wait ~10-20s, then check the explorer.\n");
} catch (e) {
  console.log("Faucet rate-limited. Request manually at https://faucet.sui.io — paste the Address above and select Testnet.\n");
}