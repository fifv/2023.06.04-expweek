import express from 'express'
import { generatePrivateKey, quickMod } from './diffie-hellman'
import CryptoJS from 'crypto-js'
import Long from 'long'
import { DHRequest, DHResponse } from './types'
import cors from 'cors'
import bodyParser from 'body-parser'
const app = express()
/**
 * fetch一个不同origin的网址会被浏览器拦下来,需要在server端配置cors
 */
app.use(cors({
    credentials: true,
    origin: true,
}))
const port = 30003

/**
 * client计算:
 * 1. g
 * 2. p
 * 3. client的私钥
 * 4. client的公钥(带hmac)
 * 
 * client发送:
 * 1. client的公钥(带hmac)
 * 2. g
 * 3. p
 * 
 * server计算:
 * 1. server的私钥
 * 2. server的公钥
 * 3. 会话秘钥
 * 
 * server发送:
 * 1. server的公钥(带hmac)
 * 
 * client收到回应的"server的公钥"后便可以计算出会话秘钥
 */
/**
 * bodyParser.json()用于把'Content-Type': 'application/json' 的 body 转换成js的object
 * 如果不用,req.body会是undefined
 */
app.post('/exchange', bodyParser.json(), (req, res) => {
    try {
        const dhRequest = req.body as DHRequest
        const g = BigInt(dhRequest.g)
        const p = BigInt(dhRequest.p)
        const pbk1 = BigInt(dhRequest.pbk1)

        const pvk2 = generatePrivateKey()
        const pbk2 = quickMod(g, pvk2, p)
        const hmacPbk2 = CryptoJS.HmacSHA256(pbk2.toString(), "Secret Passphrase").toString()
        const hmacPbk1 = CryptoJS.HmacSHA256(pbk1.toString(), "Secret Passphrase").toString()
        if (hmacPbk1 === dhRequest.hmacPbk1) {
            const secret = quickMod(pbk1, pvk2, p).toString()
            console.log('HMAC 验证成功,,可以确保收到的client的公钥是正确的:', hmacPbk1)
            console.log('secret:', secret, '(client端应该也生成了一致的会话秘钥,请检查client端的控制台输出)')
        } else {
            console.log('HMAC 验证失败!!!')
        }

        res.json({
            pbk2: pbk2.toString(),
            hmacPbk2,
        } satisfies DHResponse)
    } catch (error) {
        console.error('[ERROR] Request is Invalid!')
        console.log(req.body)
        res.sendStatus(500)
    }
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})