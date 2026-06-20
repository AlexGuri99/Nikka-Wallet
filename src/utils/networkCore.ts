export async function fetchTonBalance(address: string): Promise<number> {
  const res = await fetch(
    `https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(address)}`,
  );
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "TON fetch failed");
  return parseInt(data.result, 10) / 1e9;
}

export async function fetchTronBalance(address: string): Promise<number> {
  const res = await fetch(
    `https://api.trongrid.io/v1/accounts/${encodeURIComponent(address)}`,
  );
  const data = await res.json();
  if (!data.success || !data.data?.length) throw new Error("TRX fetch failed");
  return data.data[0].balance / 1_000_000;
}

export async function fetchUsdtBalance(address: string): Promise<number> {
  const res = await fetch(
    `https://api.trongrid.io/v1/accounts/${encodeURIComponent(address)}/trc20?contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`,
  );
  const data = await res.json();
  if (!data.success || !data.data?.length) return 0;
  const entry = data.data[0];
  const key = Object.keys(entry).find((k) => k.startsWith("TR7"));
  return key ? parseInt(entry[key], 10) / 1_000_000 : 0;
}