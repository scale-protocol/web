import { mapState, mapGetters } from 'vuex'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token'
import { PROGRAM_ID, TOKEN_MINT_ADDRESS, PROGRAM_TREASURY_ACCOUNT, useAnchorWallet } from './tokens'
import idl from './idl.json'
import { confirmTx } from './contract'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { Provider, Program, BN } from '@project-serum/anchor'
import BigNumber from 'bignumber.js'

const PAIR = {
  BTC: 'BTC/USD',
  ETH: 'ETH/USD',
  SOL: 'SOL/USD'
}

const MARKET_ACCOUNT = {
  BTC: '5ec5ZBFKDAvbZtTzMapf8YGZA6cxqnF8FMdQe9oExwDs',
  ETH: '98mrv8maXbJj6pHSUvHvZVX59PRi7f3yogz1GtZ73FPe',
  SOL: 'WbamnRrduTGPU9h4fT94k4jsLQPpn9WYgd5Be4enY37'
}

const PYTH_PRICE = {
  MAINNETBETA: {
    BTC: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    ETH: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    SOL: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'
  },
  TESTNET: {
    BTC: 'DJW6f4ZVqCnpYNN9rNuzqUcCvkVtBgixo8mq9FKSsCbJ',
    ETH: '7A98y76fcETLHnkCxjmnUrsuNrbUae7asy4TiVeGqLSs',
    SOL: '7VJsBtJzgTftYzEeooSDYyjKXvYRWJHdwvbwfBvTg9K'
  },
  DEVNET: {
    BTC: 'HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J',
    ETH: 'EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw',
    SOL: 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix'
  }
}

const CHAINLINK_PRICE = {
  MAINNETBETA: {
    BTC: 'CGmWwBNsTRDENT5gmVZzRu38GnNnMm1K5C3sFiUUyYQX',
    ETH: '5WyTBrEgvkAXjTdYTLY9PVrztjmz4edP5W9wks9KPFg5',
    SOL: 'CcPVS9bqyXbD9cLnTbhhHazLsrua8QMFUHTutPtjyDzq'
  },
  TESTNET: {
    BTC: '',
    ETH: '',
    SOL: ''
  },
  DEVNET: {
    BTC: 'CzZQBrJCLqjXRfMjRN3fhbxur2QYHUzkpaRwkWsiPqbz',
    ETH: '2ypeVyYnZaW2TNYXXTaZq9YhYvnqcjCiifW1C6n8b7Go',
    SOL: 'HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6'
  }
}

export default {
  computed: {
    ...mapState(['pubKey', 'userAccount', 'userInfo']),
    ...mapGetters(['conn']),

    provider () {
      if (this.pubKey) {
        const provider = new Provider(this.conn, useAnchorWallet(), {
          skipPreflight: false,
          commitment: 'recent'
        })
        return provider
      }
    },

    program () {
      if (this.provider) {
        return new Program(idl, PROGRAM_ID, this.provider)
      }
      return ''
    },

    authority () {
      return new PublicKey(this.pubKey)
    },

    _userAccount () {
      return new PublicKey(this.userAccount)
    }
  },
  methods: {
    // 空投
    async airDrop () {
      const rp = await this.conn.requestAirdrop(new PublicKey(this.pubKey), 1000000000)
      console.log('rp', rp)
    },
    // 新建用户交易账号
    async createUserAccount () {
      if (new BigNumber(this.conn.getBalance(this.pubKey)).lt(new BigNumber(1))) {
        await this.airDrop()
      }
      const [userAccount, bump] = await PublicKey.findProgramAddress(
        [Buffer.from('scale_user_account'), this.authority.toBuffer()],
        PROGRAM_ID
      )
      console.log('user_account', userAccount.toBase58())
      this.$store.commit('SET_USERACCOUNT', userAccount.toBase58())

      // 判断用户账号是否有账号，没有账号时，去创建
      try {
        const aa = await this.program.account.userAccount.fetch(userAccount.toBase58())
        console.log('aa', aa)
        return true
      } catch (e) {
        console.log('e', e)
        const txid = await this.program.methods
          .initializeUserAccount(bump)
          .accounts({
            initializer: this.authority,
            userAccount: this.userAccount,
            systemProgram: SystemProgram.programId
          }).rpc()
        const err = await confirmTx(txid)
        console.log('err', err)
      }
    },

    // 用户入金
    async deposit (num) {
      // this.airDrop()
      let txid = ''
      try {
        // 只有在用户存在
        const associatedToken = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, this.authority)
        const fromUserTokenAccount = await getAccount(this.conn, associatedToken)
        const _amount = new BN(num).mul(new BN(1000000))
        txid = await this.program.methods
          .deposit(_amount)
          .accounts({
            authority: this.authority,
            tokenMint: TOKEN_MINT_ADDRESS,
            userTokenAccount: fromUserTokenAccount.address,
            userAccount: new PublicKey(this.userAccount),
            vaultTokenAccount: PROGRAM_TREASURY_ACCOUNT,
            tokenProgram: TOKEN_PROGRAM_ID
          }).rpc()
      } catch (e) {
        console.log(e)
        this.$message.error('USDC is not enough in your wallet')
        return 'no balance'
      }
      try {
        console.log(txid)
        const err = await confirmTx(txid)
        console.log('deposit 交易成功', err)
        if (err) return
        return true
      } catch (e) {
        this.errorHandler(e)
      }
    },

    // 开仓
    /**
     * 开仓
     * pair 交易对名称,
     * size 合约大小,
     * leverage 杠杆大小,
     * positionType 仓位类型：1 全仓，2 逐仓,
     * direction 做单方向：1 buy，2 sell
     */
    async openPosition (pair, size, leverage, positionType, direction) {
      try {
        const [positionAccount] = await PublicKey.findProgramAddress(
          [
            Buffer.from('scale_position_account'),
            this.authority.toBuffer(),
            new PublicKey(this.userAccount).toBuffer(),
            Buffer.from(this.userInfo.account.position_seed_offset.toString())
          ],
          PROGRAM_ID
        )
        console.log(pair, size, leverage, positionType, direction)
        const json = {
          authority: this.authority.toBase58(),
          userAccount: this.userAccount,
          marketAccount: MARKET_ACCOUNT[pair],
          positionAccount: positionAccount.toBase58(),
          pythPriceAccount: PYTH_PRICE.DEVNET[pair],
          chianlinkPriceAccount: CHAINLINK_PRICE.DEVNET[pair],
          marketAccountBtc: MARKET_ACCOUNT.BTC,
          marketAccountEth: MARKET_ACCOUNT.ETH,
          marketAccountSol: MARKET_ACCOUNT.SOL,
          pythPriceAccountBtc: PYTH_PRICE.DEVNET.BTC,
          pythPriceAccountEth: PYTH_PRICE.DEVNET.ETH,
          pythPriceAccountSol: PYTH_PRICE.DEVNET.SOL,
          chainlinkPriceAccountBtc: CHAINLINK_PRICE.DEVNET.BTC,
          chainlinkPriceAccountEth: CHAINLINK_PRICE.DEVNET.ETH,
          chainlinkPriceAccountSol: CHAINLINK_PRICE.DEVNET.SOL
        }
        console.log('json', json)
        const txid = await this.program.methods
          .openPosition(PAIR[pair], size, leverage, positionType, direction)
          .accounts({
            authority: this.authority,
            userAccount: new PublicKey(this.userAccount),
            marketAccount: MARKET_ACCOUNT[pair],
            positionAccount: positionAccount,
            pythPriceAccount: PYTH_PRICE.DEVNET[pair],
            chianlinkPriceAccount: CHAINLINK_PRICE.DEVNET[pair],
            marketAccountBtc: MARKET_ACCOUNT.BTC,
            marketAccountEth: MARKET_ACCOUNT.ETH,
            marketAccountSol: MARKET_ACCOUNT.SOL,
            pythPriceAccountBtc: PYTH_PRICE.DEVNET.BTC,
            pythPriceAccountEth: PYTH_PRICE.DEVNET.ETH,
            pythPriceAccountSol: PYTH_PRICE.DEVNET.SOL,
            chainlinkPriceAccountBtc: CHAINLINK_PRICE.DEVNET.BTC,
            chainlinkPriceAccountEth: CHAINLINK_PRICE.DEVNET.ETH,
            chainlinkPriceAccountSol: CHAINLINK_PRICE.DEVNET.SOL
          }).rpc()
        console.log('txid', txid)
        const err = await confirmTx(txid)
        console.log('openPosition 交易成功', err)
        if (err) return
        return true
      } catch (e) {
        console.log(e)
        this.errorHandler(e)
      }
    },

    async instructionClosePosition (positionAccount) {
      try {
        const txid = await this.program.methods
          .closePosition(1)
          .accounts({
            authority: this.authority,
            userAccount: new PublicKey(this.userAccount),
            marketAccount: MARKET_ACCOUNT.BTC,
            positionAccount: new PublicKey(positionAccount),
            pythPriceAccount: PYTH_PRICE.DEVNET.BTC,
            chianlinkPriceAccount: CHAINLINK_PRICE.DEVNET.BTC
          }).rpc()
        console.log('txid', txid)
        const err = await confirmTx(txid)
        console.log('err', err)
        if (err) return
        return true
      } catch (e) {
        this.errorHandler(e)
      }
    },

    errorHandler (error) {
      if (typeof error !== 'boolean' && typeof error !== 'string' && error.message !== 'Cancelled') {
        this.$message.error(error.message)
      }
    }
  }
}
