const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js')
const anchor = require('@project-serum/anchor')

const SEED_USER = "nft_staking_user";
const IDL = require('../target/idl/nft_staking.json');
// const PROGRAM_NFT_STAKING = "4Kqy9CvFmzSYBNzjUG6aEKvdEh7Pon8QdUxKgKaQxMeg"
const PROGRAM_NFT_STAKING = "JCnPzmQxxP6XTJAj5nf173Rk5rxtag5dQjgvsb9tQDYA"
// const WALLET_ADDRESS = "C2MR6DkRwbYYGAmWcBkSRWjBxPR9VwvXP6CsvSH9aoZS"
const WALLET_ADDRESS = "21jemu7FxvwibQHZ74g2Fbgggy4uDpmpaXdc973gxivR"
const ADDRESS_STAKING_POOL = new PublicKey("Fk6vWeq3aVujGCxYWNvFmeuo9m5tCaukyJi27P47Ug4y");

const getStakingProgram = (provider) => {
    return new anchor.Program(IDL, PROGRAM_NFT_STAKING, provider);
};

const createProvider = (connection) => {
    return new anchor.AnchorProvider(
        connection,
        {
        signAllTransactions() {
            return Promise.resolve([]);
        },
        signTransaction() {
            return Promise.resolve(undefined);
        },
        publicKey: PROGRAM_NFT_STAKING,
        },
        {}
    );
};

const getUserAddress = async (walletPublicKey) => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(SEED_USER)),
            ADDRESS_STAKING_POOL.toBuffer(),
            walletPublicKey.toBuffer(),
        ],
        new PublicKey(PROGRAM_NFT_STAKING)
    );
};

const main = async() => {
    const connection = new Connection(clusterApiUrl('mainnet-beta'), ' confirmed')

    const [userAccount] = await getUserAddress(new PublicKey(WALLET_ADDRESS));
    const provider = createProvider(connection);
    const program = getStakingProgram(provider);

    const userAccountData = await program.account.user.fetchNullable(userAccount);
    if (!userAccountData) {
        console.log("userAccountData -> null or undefined");
        return;
    }

    /* ''' GET REWARD TOTAL EARNED ''' */
    const bitReward = userAccountData.rewardEarnedClaimed
        .div(new anchor.BN(10 ** 9))
        .toNumber()
        .toFixed(2)
    console.log("bitReward: ", bitReward);

    /* ''' GET MINTS STAKED ''' */
    const mintStakedData = await program.account.mintStaked.fetchNullable(
        userAccountData.mintStaked
    );
    if (!mintStakedData) {
        return;
    }
    console.log("mintStakedData.mintAccounts.length: ", mintStakedData.mintAccounts.length);

    // program.instruction is deprecated
    console.log("program.methods: ", program.methods.createUser);
}

main()
