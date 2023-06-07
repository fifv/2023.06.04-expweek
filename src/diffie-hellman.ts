
/**
 * 快速幂取模算法,计算a ** b % c
 * 
 * 如果直接写a ** b % c 会报错,因为这个数太大了,溢出: RangeError: Maximum BigInt size exceeded
 */
export function quickMod(a: bigint, b: bigint, c: bigint): bigint {
    let ans = 1n
    a = a % c
    while (b !== 0n) {
        if ((b & 1n) !== 0n) {
            ans = ans * a % c
        }
        b >>= 1n
        a = a * a % c
    }
    return ans
}

/**
 * 生成p
 * 由于p是大家共享的,所以直接生成定值
 */
export function generatePrime() {
    return 490366811208742240841899277683n
}

/**
 * 获得随机密钥
 */
export function generatePrivateKey() {
    const hexString = Array(16)
        .fill(0)
        .map(() => Math.round(Math.random() * 0xF).toString(16))
        .join('')

    const randomBigInt = BigInt(`0x${hexString}`)
    return randomBigInt
}



/**
 * 生成公钥
 */
export function generatePublicKey(
    g: bigint,
    privateKey: bigint,
    p: bigint
): bigint {
    return quickMod(g, privateKey, p)
}
