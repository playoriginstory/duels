import { readContract } from "@wagmi/core";
import { base } from "wagmi/chains";
import { createPublicClient, http } from "viem";

const client = createPublicClient({
  chain: base,
  transport: http(
    process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"
  ),
});

const ORIGIN = "0x45737f6950f5c9e9475e9e045c7a89b565fa3648";
const DUAL = "0xDFAC0671843E7294330C6859701729Cad3AdBdC7";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

const MIN_REQUIRED = BigInt("3500000000000000000000"); // 3500 * 1e18

export async function checkEligibility(address: `0x${string}`) {
  const [originBalance, dualBalance] = await Promise.all([
    readContract({
      address: ORIGIN,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      parameters: [address], // 👈 use 'parameters' not 'args'
      client,
    }),
    readContract({
      address: DUAL,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      parameters: [address], // 👈 use 'parameters' not 'args'
      client,
    }),
  ]);

  return (
    (originBalance as bigint) >= MIN_REQUIRED ||
    (dualBalance as bigint) >= MIN_REQUIRED
  );
}
