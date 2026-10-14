import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const data = jwt.verify(token, JWT_SECRET)
    const { usuarioId, comercioId } = data

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true }
    })

    // Buscar comercio
    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId },
      select: { nombre: true, logoUrl: true, color: true }
    })

    // Buscar relación usuario-comercio
    const usuarioComercio = await prisma.usuarioComercio.findUnique({
      where: {
        usuarioId_comercioId: {
          usuarioId,
          comercioId
        }
      },
      select: { puntos: true }
    })

    if (!usuario || !comercio || !usuarioComercio) {
      return NextResponse.json({ error: 'Datos no encontrados' }, { status: 404 })
    }

    const tokenQR = jwt.sign(
        { usuarioId, comercioId },
        process.env.FIDE_TOKEN_SECRET,
        { expiresIn: '10y' }
      ) 

    return NextResponse.json({
      usuario,
      comercio,
      puntos: usuarioComercio.puntos,
      tokenQR
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Token inválido o error interno' }, { status: 500 })
  }
}
