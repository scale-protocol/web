import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import store from '@/store'

// export const TOKEN_PROGRAM_ID = new PublicKey(
//   'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
// )

export const useAnchorWallet = () => {
  return {
    publicKey: new PublicKey(store.state.pubKey),

    async signTransaction (tx) {
      const s = window.solana
      const message = bs58.encode(tx.serializeMessage())
      const { msg, data } = await s.signTransaction(message)

      if (msg === 'ok') {
        const pk = new PublicKey(data.publicKey)
        const signature = bs58.decode(data.signature)
        tx.addSignature(pk, signature)
        return tx
      } else {
        throw new Error(msg)
      }
    },

    signAllTransactions (txs) {
      const s = window.solana
      const messages = txs.map(tx => bs58.encode(tx.serializeMessage()))
      const { msg, data } = s.signAllTransactions(messages)

      if (msg === 'ok') {
        const pk = new PublicKey(data.publicKey)
        txs.forEach((tx, i) => {
          tx.addSignature(pk, bs58.decode(data.signatures[i]))
        })
        return txs
      } else {
        throw new Error(msg)
      }
    }
  }
}
