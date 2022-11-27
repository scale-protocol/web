import { Connection, clusterApiUrl, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createMint } from '@solana/spl-token'
import store from '@/store'

// 分环境账号
export const PROGRAM_ID = new PublicKey('FXUEM9ZfqeWkAtHDCoCGB7C9cwNW1JcyhXB47i9J6B37') // 合约地址
export const TOKEN_MINT_ADDRESS = new PublicKey('3xJL46KjjDQbPUDg54nEzSC1Ejs49xFHwQJyEMPq7H7g') // 铸币地址 spl token mint
export const PROGRAM_TREASURY_ACCOUNT = new PublicKey('4chfKs49cc7yY7S6uw7i75iUXWhoZARCP9vVDoChoDHo') // 合约金库账号
export const PROGRAM_TREASURY_PDA_ACCOUNT = new PublicKey('TiUHNnZZfTZ2f6cissKxH5W5TAzmhjLQXEMzk7dc3Yo') // 合约金库 pda 签名账户

// 固定值 TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID是官方固定值，不会根据代币改变，主要是通过mint 地址区分的
export const TOKEN_PROGRAM_ID = new PublicKey('5Uzq44UgPkPNxG4E4m4m7F8fsnrHKc4jFvFuPapV4jN2')
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('GpgsvNd2K4QtEqphKREMp8WRohq5g3f8VfHgitBkU8Dv') // spl token account

export const useAnchorWallet = () => {
  return {
    publicKey: new PublicKey(store.state.pubKey),

    async signTransaction (tx) {
      try {
        const wallet = window.solana
        if (!wallet) throw Error

        try {
          return await wallet.signTransaction(tx) || tx
        } catch (error) {
          throw Error(error?.message, error)
        }
      } catch (error) {
        console.log(error)
      }
      // console.log('s', s)
      // const message = bs58.encode(tx.serializeMessage())
      // const { msg, data } = await s.signTransaction(message)
      // console.log('msg', msg)
      // console.log('data', data)

      // if (msg === 'ok') {
      //   const pk = new PublicKey(data.publicKey)
      //   const signature = bs58.decode(data.signature)
      //   tx.addSignature(pk, signature)
      //   return tx
      // } else {
      //   throw new Error(msg)
      // }
    },

    async signAllTransactions (txs) {
      try {
        const wallet = window.solana
        if (!wallet) throw Error

        try {
          return await wallet.signTransaction(txs) || txs
        } catch (error) {
          throw Error(error?.message, error)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}

export async function getOrCreateAssociatedTokenAccountasd () {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

  // Generate a new wallet keypair and airdrop SOL
  const fromWallet = Keypair.generate()
  const fromAirdropSignature = await connection.requestAirdrop(new PublicKey('6imhP9ec6sNXy7Dn19wq4hjL1oUtthtGHUEwtuCTGNL8'), LAMPORTS_PER_SOL)

  // Wait for airdrop confirmation
  await connection.confirmTransaction(fromAirdropSignature)

  // Generate a new wallet to receive newly minted token
  const toWallet = Keypair.generate()

  // Create new token mint
  const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9)

  // Get the token account of the fromWallet address, and if it does not exist, create it
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey
  )
  console.log('fromTokenAccount', fromTokenAccount)

  // Get the token account of the toWallet address, and if it does not exist, create it
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey)
  console.log('toTokenAccount', toTokenAccount)
}
