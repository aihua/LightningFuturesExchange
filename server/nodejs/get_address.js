var bjs = require('bitcoinjs-lib')
var b58 = require('bs58check')

// this function takes ypub and turns into xpub
function ypubToXpub(ypub) {
  var data = b58.decode(ypub)
  data = data.slice(4)
  data = Buffer.concat([Buffer.from('0488b21e','hex'), data])
  return b58.encode(data)
}

// this function takes an HDNode, and turns the pubkey of that node into a Segwit P2SH address
function nodeToP2shSegwitAddress(hdNode) {
  var pubkeyBuf = hdNode.keyPair.getPublicKeyBuffer()
  var hash = bjs.crypto.hash160(pubkeyBuf)
  var redeemScript = bjs.script.witnessPubKeyHash.output.encode(hash)
  var hash2 = bjs.crypto.hash160(redeemScript)
  var scriptPubkey = bjs.script.scriptHash.output.encode(hash2)
  return bjs.address.fromOutputScript(scriptPubkey)
}
// convert ypub string into xpub string
var xpub = ypubToXpub(process.argv[2])

// grab the HDNode object from the xpub
var hdNode = bjs.HDNode.fromBase58(xpub)

// generate as usual, but instead of getAddress, feed into above function
var address = nodeToP2shSegwitAddress(hdNode.derive(0).derive(parseInt(process.argv[3])))
// 3FkFtj43U6UDZ7wberPtZwUrR3GLMw2S6x

console.log(address)

return address