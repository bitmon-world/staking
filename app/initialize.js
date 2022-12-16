
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY, sendAndConfirmTransaction
} = require('@solana/web3.js')
const { Program, BN, AnchorProvider, utils } = require('@project-serum/anchor')
const {TOKEN_PROGRAM_ID} = require("@project-serum/anchor/dist/cjs/utils/token");

const ADDRESS_STAKING_POOL = new PublicKey(
    'Fk6vWeq3aVujGCxYWNvFmeuo9m5tCaukyJi27P47Ug4y'
)

// devnet aether
const PROGRAM_NFT_STAKING = new PublicKey(
    'E8im75UoSGAQUqnFcZYUTJDyZf1Zp5n9p7WrEsjvcZJ5'
)

const staking_address = "JCnPzmQxxP6XTJAj5nf173Rk5rxtag5dQjgvsb9tQDYA"

const SEED_MINT = 'nft_staking_mint'
const SEED_UNSTAKE_PROOF = 'nft_unstake_proof'

const U64_MAX = new BN('18446744073709551615')
const getNowBn = () => new BN(Date.now() / 1000)


// const staking_address = "4Kqy9CvFmzSYBNzjUG6aEKvdEh7Pon8QdUxKgKaQxMeg"

const PREFIX = 'nft_staking'


const generateUuid = () => {
    return Keypair.generate().publicKey.toBase58().slice(0, 6)
}

const getPoolAddress = async (
    configPublicKey,
    authorityPublicKey,
    programId
) => {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from(utils.bytes.utf8.encode(PREFIX)),
            authorityPublicKey.toBuffer(),
            configPublicKey.toBuffer(),
        ],
        programId
    )
}

const getRewardVaultAddress = async (
    poolAccountPubkey,
    authorityPublicKey,
    rewardMintPubKey,
    programId
) => {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from(utils.bytes.utf8.encode(PREFIX)),
            poolAccountPubkey.toBuffer(),
            authorityPublicKey.toBuffer(),
            rewardMintPubKey.toBuffer(),
        ],
        programId
    )
}

const getConfigAccount = async (walletPublicKey) => {
    return await PublicKey.findProgramAddress(
        [
            walletPublicKey.toBuffer(),
        ],
        PROGRAM_NFT_STAKING
    )
}

const main = async() => {
    const connection = new Connection(clusterApiUrl('devnet'), ' confirmed')
    const idl = require('../target/idl/nft_staking.json')
    let authorityPriv = [73,228,103,164,45,122,36,192,138,167,89,140,178,63,60,126,237,209,8,25,32,255,105,99,242,168,27,3,217,207,98,73,75,191,213,225,188,117,188,31,2,166,71,175,192,255,140,103,149,232,102,191,166,234,200,111,103,44,204,192,243,244,43,169]
        .slice(0,32);
    let authorityWallet = Keypair.fromSeed(Uint8Array.from(authorityPriv))

    console.log(authorityWallet.publicKey.toBase58())
    // const keyPair = Keypair.generate()
    const keyPair = authorityWallet;

    const provider = new AnchorProvider(connection, keyPair, {})

    //Address of the deployed program
    const programId = new PublicKey(PROGRAM_NFT_STAKING)

    //Generate the program client from IDL
    const program = new Program(idl, programId, provider)

    // console.log(program)


    const configAccountKeypair = Keypair.generate();

    const [configAccount, _] = await getConfigAccount(
        configAccountKeypair.publicKey
    )


    const [poolAccount, _pool_bump] =
        await getPoolAddress(
            configAccountKeypair.publicKey,
            authorityWallet.publicKey,
            program.programId
        )

    const [rewardVaultAccount, _reward_bump] =
        await getRewardVaultAddress(
            poolAccount,
            authorityWallet.publicKey,
            new PublicKey("ABJ3xqPVskEUsfxGiA4KDxmWzHj9YCL27zW33tzEEjo4"),
            program.programId
        )


    let uuid = generateUuid()
    let numMint = new BN("1000")
    let rewardDuration = new BN("31536000")
    let unstakeDuration = new BN(0)

    let tx =  new Transaction();

    tx.add(program.instruction.initializePool(
        uuid,
        numMint,
        rewardDuration,
        unstakeDuration,
        _pool_bump,
        _reward_bump,
        {
            accounts: {
                authority: authorityWallet.publicKey,
                poolAccount: poolAccount,
                config: configAccount,
                rewardMint: new PublicKey("ABJ3xqPVskEUsfxGiA4KDxmWzHj9YCL27zW33tzEEjo4"),
                rewardVault: rewardVaultAccount,
                rent: SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            },
            signers: [
                authorityWallet,
                configAccountKeypair
            ],
        }
    ))
    const signature = await sendAndConfirmTransaction(
        connection,
        tx,
        [authorityWallet],
        {commitment: 'confirmed'}


    );
    console.log('SIGNATURE', signature);


}

main()
