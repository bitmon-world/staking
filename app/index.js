const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js')
fs = require('fs')
anchor = require('@project-serum/anchor')

const staking_address = "JCnPzmQxxP6XTJAj5nf173Rk5rxtag5dQjgvsb9tQDYA"

// const staking_address = "4Kqy9CvFmzSYBNzjUG6aEKvdEh7Pon8QdUxKgKaQxMeg"

const main = async() => {
    const connection = new Connection(clusterApiUrl('mainnet-beta'), ' confirmed')
    const idl = require('../target/idl/nft_staking.json');
    // const idl = require('./target/idl/nft_staking.json');

    //Address of the deployed program
    const programId = new PublicKey(staking_address);

    //Generate the program client from IDL
    const program = new anchor.Program(idl, programId, connection);

    console.log(program)

    // await program.Pool.Pool.autho.fetch()
    await program.account.user.fetch(new PublicKey('21jemu7FxvwibQHZ74g2Fbgggy4uDpmpaXdc973gxivR'))
    
    
}

main()