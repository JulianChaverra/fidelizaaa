import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY

export async function POST(req) {
  try {
    const { comercioToken, puntos } = await req.json()

    if (!comercioToken || !puntos) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    let comercioData
    try {
      comercioData = jwt.verify(comercioToken, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { usuarioId, comercioId } = comercioData
    if (!usuarioId || !comercioId) {
      return NextResponse.json({ error: "Datos inválidos en token" }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
    const comercio = await prisma.comercio.findUnique({ where: { id: comercioId } })

    if (!usuario || !usuario.tokenNotificaciones) {
      return NextResponse.json({ error: "El usuario no tiene token de notificaciones" }, { status: 404 })
    }
    if (!comercio) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    const copy = `${comercio.nombre} acaba de descontar ${puntos} puntos de tu saldo. ¡Gracias por seguir sumando experiencias!`

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [usuario.tokenNotificaciones],
      headings: { es: "¡Puntos redimidos!", en: "Points redeemed!" },
      contents: {
        es: copy,
        en: `${comercio.nombre} just redeemed ${puntos} points from your balance. Thank you for being part of the experience!`
      }
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: "Error al enviar push", detalle: error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error en /api/push/redimir:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
