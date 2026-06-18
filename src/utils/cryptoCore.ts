import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { HDNodeWallet, keccak256, sha256 } from "ethers";
import { keyPairFromSeed } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

/* ── Public types ── */

export interface NikkaWalletState {
  mnemonic: string;
  tronAddress: string;
  tronPrivateKey: string;
  tonAddress: string;
  tonPublicKey: string;
}

/* ── Base-58 encoding (used by TRON address formatting) ── */

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(data: Uint8Array): string {
  if (data.length === 0) return "";

  let zeros = 0;
  while (zeros < data.length && data[zeros] === 0) zeros++;

  const encoded: number[] = [];
  for (let i = zeros; i < data.length; i++) {
    let carry = data[i];
    for (let j = 0; j < encoded.length; j++) {
      carry += encoded[j] * 256;
      encoded[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      encoded.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  return "1".repeat(zeros) + encoded.reverse().map((i) => BASE58_ALPHABET[i]).join("");
}

/* ── TRON address derivation ── */

/**
 * Converts an uncompressed secp256k1 public key into a Base58Check-encoded
 * TRON address (mainnet prefix 0x41).
 */
function publicKeyToTronAddress(publicKeyHex: string): string {
  // Strip the 0x04 uncompressed prefix if present
  const rawKey = publicKeyHex.replace("0x", "");
  const keyBytes = rawKey.startsWith("04") ? rawKey.slice(2) : rawKey;

  // keccak256 of the 64-byte public key
  const hash = keccak256("0x" + keyBytes);
  // Last 20 bytes → address body
  const addressBody = hash.slice(-40);

  // TRON mainnet payload: 0x41 prefix + 20 address bytes
  const payload = "41" + addressBody;

  // Double-SHA256 checksum
  const h1 = sha256("0x" + payload).replace("0x", "");
  const h2 = sha256("0x" + h1).replace("0x", "");
  const checksum = h2.slice(0, 8);

  const bytes = hexToBytes(payload + checksum);
  return base58Encode(bytes);
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function deriveTron(seed: Buffer): { address: string; privateKey: string } {
  const hdNode = HDNodeWallet.fromSeed(seed);
  const derived = hdNode.derivePath("m/44'/195'/0'/0/0");
  return {
    address: publicKeyToTronAddress(derived.publicKey),
    privateKey: derived.privateKey,
  };
}

/* ── TON address derivation ── */

function deriveTon(seed: Buffer): { address: string; publicKey: string } {
  // Ed25519 key pair from the first 32 bytes of the BIP-39 seed
  const kp = keyPairFromSeed(seed.subarray(0, 32));

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: kp.publicKey,
  });

  return {
    address: wallet.address.toString({ bounceable: true }),
    publicKey: kp.publicKey.toString("hex"),
  };
}

/* ── Public API ── */

/**
 * Generate a fresh non-custodial Nikka Wallet backed by a random 24-word
 * BIP-39 mnemonic.  Returns derived TRON and TON addresses.
 */
export function generateNikkaWallet(): NikkaWalletState {
  const mnemonic = generateMnemonic(256); // 256 bits → 24 words
  return restoreNikkaWallet(mnemonic);
}

/**
 * Re-derive both TRON and TON addresses from an existing BIP-39 mnemonic
 * phrase (words separated by spaces).
 */
export function restoreNikkaWallet(mnemonic: string): NikkaWalletState {
  const seed = mnemonicToSeedSync(mnemonic);

  const tron = deriveTron(seed);
  const ton = deriveTon(seed);

  return {
    mnemonic,
    tronAddress: tron.address,
    tronPrivateKey: tron.privateKey,
    tonAddress: ton.address,
    tonPublicKey: ton.publicKey,
  };
}