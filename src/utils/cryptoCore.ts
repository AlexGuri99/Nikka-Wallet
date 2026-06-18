import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { HDNodeWallet, keccak256, sha256, SigningKey, concat, getBytes } from "ethers";
import { keyPairFromSeed } from "@ton/crypto";
import { WalletContractV4, internal, toNano, TonClient, Address } from "@ton/ton";

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

/* ── Address validation ── */

export function isValidTronAddress(addr: string): boolean {
  if (!/^T[A-Za-z0-9]{33}$/.test(addr)) return false;
  try {
    const decoded = base58Decode(addr);
    return decoded.length === 21 && decoded[0] === 0x41;
  } catch {
    return false;
  }
}

export function isValidTonAddress(addr: string): boolean {
  try {
    Address.parse(addr);
    return true;
  } catch {
    return false;
  }
}

export function tronAddressToHex(addr: string): string {
  const decoded = base58Decode(addr);
  return "0x" + Array.from(decoded.slice(1))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base58Decode(str: string): Uint8Array {
  let zeros = 0;
  while (zeros < str.length && str[zeros] === "1") zeros++;

  const result: number[] = [];
  for (let i = zeros; i < str.length; i++) {
    let carry = BASE58_ALPHABET.indexOf(str[i]);
    if (carry === -1) throw new Error("Invalid base58 char");
    for (let j = 0; j < result.length; j++) {
      carry += result[j] * 58;
      result[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      result.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (let i = 0; i < zeros; i++) result.push(0);
  return new Uint8Array(result.reverse());
}

/* ── Mnemonic encryption / decryption (Web Crypto API) ── */

export async function encryptMnemonic(mnemonic: string, pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin.padEnd(8)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(mnemonic),
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptMnemonic(encrypted: string, pin: string): Promise<string> {
  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin.padEnd(8)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  return new TextDecoder().decode(decrypted);
}

/* ── TRON transaction helpers ── */

/**
 * Sign a TRON transaction JSON (containing txID) and return the signature hex.
 */
export function signTronTransaction(tronPrivateKey: string, txID: string): string {
  const sk = new SigningKey(tronPrivateKey.startsWith("0x") ? tronPrivateKey : "0x" + tronPrivateKey);
  const sig = sk.sign(getBytes("0x" + txID));
  const r = sig.r.slice(2).padStart(64, "0");
  const s = sig.s.slice(2).padStart(64, "0");
  const v = (sig.v + 27).toString(16).padStart(2, "0");
  return r + s + v;
}

/**
 * Build a TRX transfer transaction by calling the TRON API, sign it, and return
 * the signed JSON ready for broadcast.
 */
export async function createAndSignTronTransfer(
  tronPrivateKey: string,
  fromAddress: string,
  toAddress: string,
  amountSun: number,
): Promise<object> {
  const resp = await fetch("https://api.trongrid.io/wallet/createtransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: fromAddress,
      to_address: toAddress,
      amount: amountSun,
      visible: true,
    }),
  });
  const tx = await resp.json();
  if (!tx.txID) throw new Error(tx.Error || "Failed to create TRX transaction");
  const signature = signTronTransaction(tronPrivateKey, tx.txID);
  return { ...tx, signature: [signature] };
}

/**
 * Build a TRC-20 USDT transfer by triggering the smart contract, sign it,
 * and return the signed JSON ready for broadcast.
 */
export async function createAndSignUsdtTransfer(
  tronPrivateKey: string,
  fromAddress: string,
  toAddress: string,
  amountUnits: number,
): Promise<object> {
  // transfer(address,uint256) encoded
  const toHex = tronAddressToHex(toAddress).replace("0x", "").padStart(64, "0");
  const amtHex = amountUnits.toString(16).padStart(64, "0");
  const parameter = toHex + amtHex;

  const resp = await fetch("https://api.trongrid.io/wallet/triggersmartcontract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: fromAddress,
      contract_address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      function_selector: "transfer(address,uint256)",
      parameter,
      visible: true,
      fee_limit: 50_000_000, // 50 TRX max fee
      call_value: 0,
    }),
  });
  const data = await resp.json();
  if (!data.transaction?.txID) throw new Error(data.Error || "Failed to create USDT transaction");
  const tx = data.transaction;
  const signature = signTronTransaction(tronPrivateKey, tx.txID);
  return { ...tx, signature: [signature] };
}

/**
 * Broadcast a signed TRON transaction and return the txid.
 */
export async function broadcastTronTransaction(signedTx: object): Promise<string> {
  const resp = await fetch("https://api.trongrid.io/wallet/broadcasttransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signedTx),
  });
  const data = await resp.json();
  if (!data.result) throw new Error(data.Error || data.message || "TRON broadcast failed");
  return (signedTx as Record<string, unknown>).txID as string;
}

/* ── TON transfer helper ── */

/**
 * Build, sign, and broadcast a TON transfer via TonCenter.
 * Returns the transaction hash as a hex string.
 */
export async function createAndSendTonTransfer(
  mnemonic: string,
  recipientAddress: string,
  amountTon: number,
): Promise<string> {
  const seed = mnemonicToSeedSync(mnemonic);
  const kp = keyPairFromSeed(seed.subarray(0, 32));

  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
  });

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: kp.publicKey,
  });

  const opened = client.open(wallet);
  const seqno = await opened.getSeqno();
  const amountNano = toNano(amountTon.toString());

  const transfer = opened.createTransfer({
    seqno,
    secretKey: kp.secretKey,
    messages: [
      internal({
        to: recipientAddress,
        value: amountNano,
      }),
    ],
  });

  // Convert signed cell to BOC buffer and broadcast
  await client.sendFile(transfer.toBoc());

  // Seqno increments by 1 after a successful transfer
  return `seqno:${seqno + 1}`;
}