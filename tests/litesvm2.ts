import { expect, test } from "bun:test";
import * as anchor from "@coral-xyz/anchor";
import { type Keypair, PublicKey } from "@solana/web3.js";
import { initAnchorPda, svm } from "./litesvm-utils.ts";
import { bytesToBigint, getAnchorDisc, getAnchorPda, ll } from "./utils.ts";
import { adminKp, type PriceFeed } from "./web3jsSetup.ts";

//clear; jj tts 1
let signerKp: Keypair;
let signer: PublicKey;
let mint: PublicKey;
let userAta: PublicKey;
let tokenProgram: PublicKey;
let pricefeed: PriceFeed;
let amount: bigint;
let price: bigint;
let newU64: bigint;

import type { FutureOptionMarket } from "../target/types/future_option_market.ts";

ll("in litesvm1.ts");
//const provider = anchor.AnchorProvider.env();
//anchor.setProvider(provider);
const program = anchor.workspace
	.futureOptionMarket as anchor.Program<FutureOptionMarket>;
//const wat = provider.wallet as anchor.Wallet;
//const wallet = wat.publicKey;
//ll("wallet:", wallet.toBase58());

const pgid = program.programId;
const anchorPdaOut = getAnchorPda(pgid);

test("InitAnchorPda", async () => {
	ll("\n------== InitAnchorPda");
	signerKp = adminKp;
	signer = signerKp.publicKey;
	ll("signer:", signerKp.publicKey.toBase58());
	const tokenBalc = 73200n;
	initAnchorPda(signerKp, anchorPdaOut, tokenBalc);

	const pdaRaw = svm.getAccount(anchorPdaOut.pukey);
	expect(pdaRaw).not.toBeNull();
	expect(pdaRaw?.owner).toEqual(pgid);

	const rawAccountData = pdaRaw?.data;
	ll("rawAccountData:", rawAccountData);
	if (rawAccountData === undefined) throw new Error("rawAccountData undefined");

	const pukey0Bytes = rawAccountData.slice(8, 40);
	const admin1 = new PublicKey(pukey0Bytes);
	ll("adminOut:", admin1.toBase58());
	expect(signer).toEqual(admin1);

	const tokenBalc1 = bytesToBigint(rawAccountData.slice(40, 48)) as bigint;
	ll("tokenBalc1:", tokenBalc1);
	expect(tokenBalc1).toEqual(tokenBalc);

	const bump1 = bytesToBigint(rawAccountData.slice(48)) as bigint;
	expect(bump1).toEqual(BigInt(anchorPdaOut.bump));
});

test("Generate Anchor Discriminator", async () => {
	ll("\n------== Generate Anchor Discriminator");
	getAnchorDisc("initialize");
	getAnchorDisc("initAnchorPda");
	getAnchorDisc("withdrawUserTokens");
	getAnchorDisc("withdrawUserTokens", true);
});
