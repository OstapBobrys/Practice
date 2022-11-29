const Tx = require('ethereumjs-tx').Transaction
const Web3 = require('web3')
const web3 = new Web3('https://goerli.infura.io/v3/process.env.INFURA_KEY')

const account1 = '0x9316da8aF53d5030a22997345b338F628Cf69606'
const account2 = '0xbCAe8fb7A84f437d15760779897bfCB11E5AA969'

const privateKey1 = Buffer.from(process.env.PRIVATE_KEY_1, 'hex')
const privateKey2 = Buffer.from(process.env.PRIVATE_KEY_2, 'hex')



web3.eth.getBalance(account1, (err, bal) => {
    console.log('account 1 balance :', web3.utils.fromWei(bal, 'ether'))
})

web3.eth.getBalance(account2, (err, bal) => {
    console.log('account 2 balance :', web3.utils.fromWei(bal, 'ether'))
})

web3.eth.getTransactionCount(account1, (err, txCount) => {
    const txObject = {
        nonce: web3.utils.toHex(txCount),
        from: account1,
        to: account2,
        value: web3.utils.toHex(web3.utils.toWei('0.5', 'ether')),
        gasLimit: web3.utils.toHex(21000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
    }

    const tx = new Tx(txObject, { chain: 'goerli'})
    tx.sign(privateKey1)

    const serializedTransaction = tx.serialize()
    const raw = '0x' + serializedTransaction.toString('hex')
    
    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
        console.log('err:', err)
        console.log('txHash:', txHash)
    })
})
