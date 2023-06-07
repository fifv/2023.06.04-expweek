import { generatePrimeSync,checkPrimeSync } from 'crypto'
console.log(generatePrimeSync(99,{bigint: true,}));
console.log(checkPrimeSync(99194853094755497n));
console.log(99194853094755497n.toString(16));