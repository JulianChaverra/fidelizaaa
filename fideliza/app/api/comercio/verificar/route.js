// /api/comercio/verificar/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const { correo, codigo } = await req.json()
    if (!correo || !codigo) {
      return NextResponse.json({ error: 'Correo y código requeridos' }, { status: 400 })
    }

    const comercio = await prisma.comercio.findUnique({ where: { correo } })
    if (!comercio || comercio.codigoLogin !== codigo) {
      return NextResponse.json({ error: 'Código incorrecto o comercio no encontrado' }, { status: 401 })
    }

    const token = jwt.sign({ comercioId: comercio.id }, JWT_SECRET, { expiresIn: '10y' })

    // Limpia el código para evitar reusos
    await prisma.comercio.update({ where: { id: comercio.id }, data: { codigoLogin: null } })

    return NextResponse.json({ success: true, token })
  } catch (err) {
    console.error('Error verificación comercio:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
