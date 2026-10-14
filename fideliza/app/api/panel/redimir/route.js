import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const body = await req.json()
    const { token, tokenUser } = body

    if (!token || !tokenUser) {
      return NextResponse.json({ error: "Tokens requeridos" }, { status: 400 })
    }

    let comercioData, transaccionData
    try {
      comercioData = jwt.verify(tokenUser, JWT_SECRET)
      transaccionData = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { usuarioId, comercioId } = comercioData
    const { puntos, timestamp } = transaccionData

    if (!usuarioId || !comercioId || typeof puntos !== 'number' || puntos < 1) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const ahora = Date.now()
    if (!timestamp || Math.abs(ahora - timestamp) > 5 * 60 * 1000) {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 })
    }

    let usuarioComercio = await prisma.usuarioComercio.findUnique({
      where: { usuarioId_comercioId: { usuarioId, comercioId } }
    })

    if (!usuarioComercio) {
      return NextResponse.json({ error: "El usuario no tiene puntos en este comercio" }, { status: 404 })
    }

    // Validar que tiene suficientes puntos
    if (usuarioComercio.puntos < puntos) {
      return NextResponse.json({ error: "No tienes suficientes puntos para redimir" }, { status: 400 })
    }

    const nuevosPuntos = (usuarioComercio.puntos - puntos)

    await prisma.usuarioComercio.update({
      where: { id: usuarioComercio.id },
      data: { puntos: nuevosPuntos }
    })

    await prisma.transaccion.create({
      data: {
        usuarioComercioId: usuarioComercio.id,
        comercioId,
        tipo: "redeem",
        puntos,
        nota: "Redención de puntos en panel"
      }
    })

   return NextResponse.json({ success: true, puntos: nuevosPuntos })

  } catch (err) {
    console.error("Error en /api/panel/redimir:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
