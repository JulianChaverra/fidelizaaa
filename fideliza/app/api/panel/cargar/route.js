import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET // Usa el mismo secret para ambos tokens, si quieres puedes diferenciarlos

export async function POST(req) {
  try {
    const body = await req.json()
    const { token, tokenUser } = body

    if (!token || !tokenUser) {
      return NextResponse.json({ error: "Tokens requeridos" }, { status: 400 })
    }

    // Decodifica ambos tokens
    let userData, transaccionData
    try {
      userData = jwt.verify(tokenUser, JWT_SECRET)
      transaccionData = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const {usuarioId,comercioId } = userData
    const { puntos, timestamp } = transaccionData

    // Validación de datos
    if (!usuarioId || !comercioId || typeof puntos !== 'number' || puntos < 1) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Verifica timestamp para evitar replay attacks (5 min tolerancia)
    const ahora = Date.now()
    if (!timestamp || Math.abs(ahora - timestamp) > 5 * 60 * 1000) {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 })
    }

    // Busca o crea relación UsuarioComercio
    let usuarioComercio = await prisma.usuarioComercio.findUnique({
      where: { usuarioId_comercioId: { usuarioId, comercioId } }
    })

    if (!usuarioComercio) {
      usuarioComercio = await prisma.usuarioComercio.create({
        data: { usuarioId, comercioId, puntos: 0 }
      })
    }

    // Suma los puntos
    const puntosPrevios = usuarioComercio.puntos
    const nuevosPuntos = puntosPrevios + puntos

    // Actualiza los puntos del usuario en ese comercio
    await prisma.usuarioComercio.update({
      where: { id: usuarioComercio.id },
      data: { puntos: nuevosPuntos }
    })

    // Registra la transacción
    await prisma.transaccion.create({
      data: {
        usuarioComercioId: usuarioComercio.id,
        comercioId,
        tipo: "add",
        puntos,
        nota: "Carga de puntos en panel"
      }
    })

    // (Opcional: puedes integrar aquí lógica de notificación push)

    return NextResponse.json({ success: true, puntos: nuevosPuntos })

  } catch (err) {
    console.error("Error en /api/panel/cargar:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
