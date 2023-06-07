
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { range } from 'lodash-es'
import clsx from 'clsx'
import { generatePrime, generatePrivateKey, generatePublicKey, quickMod } from './diffie-hellman'
import Long from "long"
import { hex, sign } from './hmac'
import { Flipper, Flipped } from 'react-flip-toolkit'
import CryptoJS from 'crypto-js'
import { DHRequest, DHResponse } from './types'

export default function App() {
    const [step, setStep] = useState(11)
    const [g, setG] = useState(2n)
    const [p, setP] = useState(generatePrime())
    const [pvk1, setPvk1] = useState(generatePrivateKey())
    const [pvk2, setPvk2] = useState(generatePrivateKey())

    const pbk1 = quickMod(g, pvk1, p)
    const pbk2 = quickMod(g, pvk2, p)

    const hmacPbk1 = CryptoJS.HmacSHA256(pbk1.toString(), "Secret Passphrase")
    const hmacPbk2 = CryptoJS.HmacSHA256(pbk2.toString(), "Secret Passphrase")

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

    return (
        <Flipper flipKey={ step }>
            <DHClient></DHClient>
            <div className={ clsx(
                'flex h-screen ',
            ) }>
                <div className={ clsx(
                    'flex flex-col items-center justify-center break-all grow',
                ) }>
                    <div className={ clsx(
                        'card  bg-base-100 shadow-xl p-3 m-3 w-1/2 transition-all h-72',
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
                            'card bg-base-100 shadow-xl p-3 m-3 w-1/2 transition-all h-[24rem]',
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
                                    Secret: { quickMod(pbk1, pvk2, p).toString() }
                                </div>
                            }
                        </div>
                        <div className={ clsx(
                            'card  bg-base-100 shadow-xl p-3 m-3 w-1/2 transition-all h-[24rem]',
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
                                    Secret: { quickMod(pbk2, pvk1, p).toString() }
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
    const [g, setG] = useState(2n)
    const [p, setP] = useState(generatePrime())
    const [pvk1, setPvk1] = useState(generatePrivateKey())

    const pbk1 = generatePublicKey(g, pvk1, p)

    const hmacPbk1 = CryptoJS.HmacSHA256(pbk1.toString(), "Secret Passphrase").toString()

    return (
        <div>
            <button
                className={ clsx(
                    'btn btn-primary',
                ) }
                onClick={ async (e) => {
                    /**
                     * 因为bigint不能被stringify,所以需要手动转成string,并在server端重新转换成bigint
                     */
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
                    if (hmacPbk2 === dhResponse.hmacPbk2) {
                        const secret = quickMod(pbk2, pvk1, p).toString()
                        console.log('HMAC 验证成功,可以确保收到的server的公钥是正确的:', hmacPbk2)
                        console.log('secret:', secret, '(server端应该也生成了一致的会话秘钥,请检查server端的控制台输出)')
                    } else {
                        console.log('HMAC 验证失败!!!')
                    }

                } }
            >DH Exchange</button>
        </div>
    )
}
