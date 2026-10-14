import crypto from 'crypto'

const reference = 'cmcldn8nf0002cya8m3oaq2co'
const amountInCents = '2490000'
const currency = 'COP'
const INTEGRITY_SECRET = 'test_integrity_U4dE1yLiDS9QUirP79DRwJWUzvhXma7F'

const cadena = reference + amountInCents + currency + INTEGRITY_SECRET
console.log('CADENA:', cadena)

const hash = crypto.createHash('sha256').update(cadena).digest('hex')
console.log('HASH:', hash)