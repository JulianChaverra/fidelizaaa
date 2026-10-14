import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    let comercioId
    try {
      console.log(token)
      const decoded = jwt.verify(token, JWT_SECRET)
      console.log(decoded)
      comercioId = decoded.comercioId
    } catch(er) {
      console.log(er)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId },
      select: {
        nombre: true,
        slug:true,
        logoUrl: true,
        color: true
      }
    })

    if (!comercio) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ comercio })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
