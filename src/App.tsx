
import { useState } from 'react'
import { range } from 'lodash-es'
import clsx from 'clsx'
import { generatePrime, generatePrivateKey, generatePublicKey, quickMod } from './diffie-hellman'
import { Flipper, Flipped } from 'react-flip-toolkit'
import CryptoJS from 'crypto-js'
import { DHRequest, DHResponse } from './types'

export default function App() {
    return (
        <>
            <div className="divider">C/S 结构秘钥交换, 请同时打开Server使用</div>
            <DHClient></DHClient>
            <div className="divider">秘钥交换演示</div>
            <DHDemo></DHDemo>
        </>
    )
}

function DHDemo() {
    /**
     * 计算好所有需要的东西,根据step的不同展示不同的内容
     * 
     * 1. g
     * 2. p
     * 3. Alice的私钥
     * 4. Alice的公钥(带hmac)
     * 5. Bob的私钥
     * 6. Bob的公钥(带hmac)
     * 7. Alice算出的会话秘钥secret
     * 8. Bob算出的会话秘钥secret
     */
    const [step, setStep] = useState(1)
    const [g, setG] = useState(2n)
    const [p, setP] = useState(generatePrime())
    const [pvk1, setPvk1] = useState(generatePrivateKey())
    const [pvk2, setPvk2] = useState(generatePrivateKey())

    const pbk1 = quickMod(g, pvk1, p)
    const pbk2 = quickMod(g, pvk2, p)

    const hmacPbk1 = CryptoJS.HmacSHA256(pbk1.toString(), "Secret Passphrase")
    const hmacPbk2 = CryptoJS.HmacSHA256(pbk2.toString(), "Secret Passphrase")

    const secret1 = quickMod(pbk1, pvk2, p).toString()
    const secret2 = quickMod(pbk2, pvk1, p).toString()

    /**
     * 把重复的一些Element抽出来,降低代码重复
     */
    function Pbk1({ isAbsolute, isShowHmac, ...rest }: { isAbsolute?: boolean, isShowHmac?: boolean }) {
        return (
            <div className={ clsx(
                'font-bold text-purple-300 z-[999]',
                isAbsolute && 'absolute top-0',
            ) } { ...rest }>
                Alice's Public Key: { pbk1.toString() }
                {
                    isShowHmac &&
                    <div className={ clsx(
                        'text-sm font-normal opacity-50',
                    ) }>HMAC: { hmacPbk1.toString() }</div>
                }
            </div>
        )
    }
    function Pbk2({ isAbsolute, isShowHmac, ...rest }: { isAbsolute?: boolean, isShowHmac?: boolean }) {
        return (
            <div className={ clsx(
                'font-bold text-green-300 z-[999]',
                isAbsolute && 'absolute top-0',
            ) } { ...rest }>
                Bob's Public Key: { pbk2.toString() }
                {
                    isShowHmac &&
                    <div className={ clsx(
                        'text-sm font-normal opacity-50',
                    ) }>HMAC: { hmacPbk2.toString() }</div>
                }
            </div>
        )
    }

    /**
     * 使用flip库实现一些小动画
     */
    return (
        <Flipper flipKey={ step }>
            <div className={ clsx(
                'flex h-screen ',
            ) }>
                <div className={ clsx(
                    'flex flex-col items-center justify-center break-all grow',
                ) }>
                    <div className={ clsx(
                        'card  bg-base-300 shadow-xl p-3 m-3 w-1/2 transition-all h-72',
                    ) }>
                        <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                                <span className="text-3xl">Eve</span>
                            </div>
                        </div>
                        <div className={ clsx(
                            'font-bold text-yellow-200',
                        ) }>
                            g: { g.toString() }
                        </div>
                        <div className={ clsx(
                            'font-bold text-yellow-200',
                        ) }>
                            p: { p.toString() }
                        </div>
                        {
                            step >= 4 &&
                            <Flipped translate flipId={ 'Alice Public Key 2' }>
                                <Pbk1 isShowHmac={ step >= 3 }></Pbk1>
                            </Flipped>
                        }
                        {
                            step >= 4 &&
                            <Flipped translate flipId={ 'Bob Public Key 2' }>
                                <Pbk2 isShowHmac={ step >= 3 }></Pbk2>
                            </Flipped>
                        }



                    </div>
                    <div className={ clsx(
                        'flex w-full',
                    ) }>
                        <div className={ clsx(
                            'card bg-base-300 shadow-xl p-3 m-3 w-1/2 transition-all h-[24rem]',
                        ) }>
                            <div className="avatar placeholder">
                                <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                                    <span className="text-3xl">Alice</span>
                                </div>
                            </div>

                            <div className={ clsx(
                                'font-bold text-yellow-200',
                            ) }>
                                g: { g.toString() }
                            </div>
                            <div className={ clsx(
                                'font-bold text-yellow-200',
                            ) }>
                                p: { p.toString() }
                            </div>
                            <div className={ clsx(
                                'font-bold text-purple-300',
                            ) }>
                                Alice's Private Key: { pvk1.toString() }
                            </div>
                            <div className={ clsx(
                                'relative',
                            ) }>
                                {
                                    step >= 2 &&
                                    range(step === 3 ? 3 : 1).map((item) =>
                                        <Flipped translate flipId={ 'Alice Public Key ' + item } key={ item }>
                                            <Pbk1 isShowHmac={ step >= 3 } isAbsolute={ item >= 1 }></Pbk1>
                                        </Flipped>
                                    )


                                }
                            </div>
                            {
                                step >= 4 &&
                                <Flipped translate flipId={ 'Bob Public Key 1' }>
                                    <Pbk2 isShowHmac={ step >= 3 }></Pbk2>
                                </Flipped>
                            }
                            {
                                step >= 5 &&
                                <div className={ clsx(
                                    'text-red-300',
                                ) }>
                                    Calc HMAC: { hmacPbk2.toString() }
                                </div>
                            }
                            {
                                step >= 6 &&
                                <div className={ clsx(
                                    step === 6 && 'font-bold text-blue-400',
                                ) }>
                                    Secret: { secret1 }
                                </div>
                            }
                        </div>
                        <div className={ clsx(
                            'card  bg-base-300 shadow-xl p-3 m-3 w-1/2 transition-all h-[24rem]',
                        ) }>
                            <div className="avatar placeholder">
                                <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                                    <span className="text-3xl">Bob</span>
                                </div>
                            </div>
                            <div className={ clsx(
                                'font-bold text-yellow-200',
                            ) }>
                                g: { g.toString() }
                            </div>
                            <div className={ clsx(
                                'font-bold text-yellow-200',
                            ) }>
                                p: { p.toString() }
                            </div>
                            <div className={ clsx(
                                'font-bold text-green-300',
                            ) }>
                                Bob's Private Key: { pvk2.toString() }
                            </div>
                            <div className={ clsx(
                                'relative',
                            ) }>
                                {
                                    step >= 2 &&
                                    range(step === 3 ? 3 : 1).map((item) =>
                                        <Flipped translate flipId={ 'Bob Public Key ' + item } key={ item } >
                                            <Pbk2 isShowHmac={ step >= 3 } isAbsolute={ item >= 1 }></Pbk2>
                                        </Flipped>
                                    )
                                }
                            </div>
                            {
                                step >= 4 &&
                                <Flipped translate flipId={ 'Alice Public Key 1' }>
                                    <Pbk1 isShowHmac={ step >= 3 }></Pbk1>
                                </Flipped>
                            }
                            {
                                step >= 5 &&
                                <div className={ clsx(
                                    'text-red-300',
                                ) }>
                                    Calc HMAC: { hmacPbk1.toString() }
                                </div>
                            }
                            {
                                step >= 6 &&
                                <div className={ clsx(
                                    step === 6 && 'font-bold text-blue-400',
                                ) }>
                                    Secret: { secret2 }
                                </div>
                            }
                        </div>

                    </div>


                </div>
                <div className={ clsx(
                    'flex flex-col',
                ) }>
                    <div className={ clsx(
                        'btn btn-warning m-3',
                    ) } onClick={ () => {
                        /**
                         * 重新生成两者的私钥
                         */
                        setStep(1)
                        setPvk1(generatePrivateKey())
                        setPvk2(generatePrivateKey())
                    } }>Reset</div>

                    <ul className="steps steps-vertical m-3 w-[24rem] flex-shrink-0 h-3/4">

                        <li className={ clsx("step cursor-pointer", step >= 1 && 'step-primary') } onPointerEnter={ () => setStep(1) }>生成g, p和Alice Bob各自的私钥</li>
                        <li className={ clsx("step cursor-pointer", step >= 2 && 'step-primary') } onPointerEnter={ () => setStep(2) }>Alice, Bob计算各自的公钥</li>
                        <li className={ clsx("step cursor-pointer", step >= 3 && 'step-primary') } onPointerEnter={ () => setStep(3) }>Alice, Bob计算公钥的HMAC</li>
                        <li className={ clsx("step cursor-pointer", step >= 4 && 'step-primary') } onPointerEnter={ () => setStep(4) }>Alice, Bob把各自公钥+HMAC传送给对方</li>
                        <li className={ clsx("step cursor-pointer", step >= 5 && 'step-primary') } onPointerEnter={ () => setStep(5) }>Alice, Bob使用HMAC验证收到的公钥</li>
                        <li className={ clsx("step cursor-pointer", step >= 6 && 'step-primary') } onPointerEnter={ () => setStep(6) }>Alice, Bob计算会话秘钥</li>

                    </ul>
                </div>
            </div>
        </Flipper>
    )

}

function DHClient() {
    /**
     * client需要计算的东西:
     * 1. g
     * 2. p
     * 3. client的私钥
     * 4. client的公钥(带hmac)
     */
    const [g, setG] = useState(2n)
    const [p, setP] = useState(generatePrime())
    const [pvk1, setPvk1] = useState(generatePrivateKey())

    const pbk1 = generatePublicKey(g, pvk1, p)
    const hmacPbk1 = CryptoJS.HmacSHA256(pbk1.toString(), "Secret Passphrase").toString()

    /**
     * 计算结果,计算的过程在下面的onClick handle中
     */
    const [hmacPbk2Msg, setHmacPbk2Msg] = useState<string | undefined>(undefined)
    const [secretMsg, setSecretMsg] = useState<string>('')

    return (
        <div className={ clsx(
            'p-3',
        ) }>
            <div className={ clsx(
                'w-full flex items-center justify-center',
            ) }>
                <button
                    className={ clsx(
                        'btn btn-primary ',
                    ) }
                    onClick={ async (e) => {
                        /**
                         * 向server发送请求,带上所需的数据
                         * 
                         * 因为bigint不能被stringify,所以需要手动转成string,并在server端重新转换成bigint
                         */
                        try {

                            const dhResponse = await (await fetch(
                                'http://localhost:30003/exchange',
                                {
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        g: g.toString(),
                                        hmacPbk1: hmacPbk1,
                                        p: p.toString(),
                                        pbk1: pbk1.toString(),
                                    } satisfies DHRequest)
                                }
                            )).json() as DHResponse

                            const pbk2 = BigInt(dhResponse.pbk2)

                            const hmacPbk2 = CryptoJS.HmacSHA256(pbk2.toString(), "Secret Passphrase").toString()

                            /**
                             * 验证HMAC
                             */
                            if (hmacPbk2 === dhResponse.hmacPbk2) {
                                const secret = quickMod(pbk2, pvk1, p).toString()
                                setHmacPbk2Msg(hmacPbk2)
                                setSecretMsg(secret)
                                console.log('HMAC 验证成功,可以确保收到的server的公钥是正确的:', hmacPbk2)
                                console.log('secret:', secret, '(server端应该也生成了一致的会话秘钥,请检查server端的控制台输出)')
                            } else {
                                console.log('HMAC 验证失败!!!')
                            }

                        } catch (error) {
                            alert('连接失败!请确保打开Server!')
                        }
                    } }
                >Diffie-Hellman Exchange</button>
            </div>
            {
                hmacPbk2Msg && (
                    hmacPbk2Msg === ''
                        ?
                        <div className="alert alert-error my-3 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <h3 className="font-bold text-red-400">HMAC 验证失败!!!</h3>
                            </div>
                        </div>
                        :
                        <div className="alert alert-success my-3 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <h3 className="font-bold">HMAC 验证成功,可以确保收到的server的公钥是正确的,HMAC值:</h3>
                                <div className="text-xs">{ hmacPbk2Msg }</div>
                            </div>
                        </div>
                )
            }
            {
                secretMsg &&
                <>
                    <div className="alert alert-info my-3 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div>
                            <h3 className="font-bold">会话秘钥: (server端应该也生成了一致的会话秘钥,请检查server端的控制台输出)</h3>
                            <div className="text-xs">{ secretMsg }</div>
                        </div>
                    </div>
                    <div className="alert alert-info my-3 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div>
                            <h3 className="font-bold">中间数据:</h3>
                            <div className="text-xs">p: { p.toString() }</div>
                            <div className="text-xs">g: { g.toString() }</div>
                            <div className="text-xs">Client 公钥: { pbk1.toString() }</div>
                            <div className="text-xs">Client 私钥: { pvk1.toString() }</div>
                        </div>
                    </div>
                </>
            }
        </div>
    )
}
