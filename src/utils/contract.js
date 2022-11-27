import bs58 from 'bs58'
import store from '@/store'

export const confirmTx = async (txid) => {
  try {
    const cfmRp = await store.getters.conn.confirmTransaction(txid, 'recent')
    console.log('cfmRp', cfmRp)
    if (cfmRp.value.err !== null) {
      this.$message.error('Timeout, please wait for confirmation of results on the Solana')
      return cfmRp.value.err
    }
    return ''
  } catch (error) {
    console.log(error)
  }
}

// 发送 and 确认交易
export const sendAndConfirm = async (tx, wallet, conn) => {
  const signers = []
  try {
    tx.recentBlockhash = await (await conn.getRecentBlockhash('max')).blockhash
    tx.setSigners(wallet, ...signers.map((s) => s.publicKey))
    if (signers.length > 0) {
      tx.partialSign(...signers)
    }
    let transaction = tx.serializeMessage()
    transaction = bs58.encode(transaction)
    const s = window.solana
    const rp = await s.signTransaction(transaction)
    if (rp.msg === 'ok') {
      const signature = rp.data.signature
      tx.addSignature(wallet, bs58.decode(signature))
      const rawTransaction = tx.serialize()
      const txid = await conn.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: 'single'
      })
      const rp2 = await conn.confirmTransaction(txid, 'recent')
      if (rp2.value.err === null) {
        return 'success'
      } else {
        return 'Transaction Failed, please check the wallet and try again'
      }
    } else {
      return rp.msg
    }
  } catch (error) {
    if (error.message) {
      return error.message
    }
  }
}
