import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as idl from "./target/idl/nft_staking.json";
import { Provider, Wallet, Program, Idl } from "@project-serum/anchor";
import * as bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

const STAKING_PROGRAM = new PublicKey(
  "JCnPzmQxxP6XTJAj5nf173Rk5rxtag5dQjgvsb9tQDYA"
);
const ADDRESS_STAKING_POOL = new PublicKey(
  "Fk6vWeq3aVujGCxYWNvFmeuo9m5tCaukyJi27P47Ug4y"
);

async function main() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.KEYPAIR));
  const wallet = new Wallet(keypair);
  const provider = new Provider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "recent",
  });

  const staking = new Program(idl as Idl, STAKING_PROGRAM, provider);
  const res = staking.rpc.
}

main();
