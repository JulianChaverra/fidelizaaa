// pages/api/panel/resumen.js

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { token } = await req.json()
    const JWT_SECRET = process.env.FIDE_TOKEN_SECRET
    const decoded = jwt.verify(token, JWT_SECRET)
    const comercioId = decoded.comercioId
    if (!comercioId) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Trae usuarios de este comercio, con transacciones
    const usuarios = await prisma.usuarioComercio.findMany({
      where: { comercioId },
      include: {
        usuario: true,
        transacciones: true
      }
    })

    // Construye resumen por usuario
    const resumen = usuarios.map(uc => {
      const nombre = uc.usuario?.nombre || uc.usuario?.telefono
      const transaccionesAdd = uc.transacciones.filter(t => t.tipo === 'add')
      const transaccionesRedeem = uc.transacciones.filter(t => t.tipo === 'redeem')

      return {
        usuarioId: uc.usuarioId,
        nombre,
        comprasTotales: transaccionesAdd.length,
        vecesRedimio: transaccionesRedeem.length,
        totalRedimido: transaccionesRedeem.reduce((acc, t) => acc + t.puntos, 0),
        puntosActuales: uc.puntos
      }
    })
    resumen.sort((a, b) => b.puntosActuales - a.puntosActuales)

    return NextResponse.json({ resumen })
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener resumen', detalle: err.message }, { status: 500 })
  }
}
