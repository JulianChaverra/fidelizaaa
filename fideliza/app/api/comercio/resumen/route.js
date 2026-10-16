import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 })
    }

    // 1. Validar JWT del Comercio
    let comercioId
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      comercioId = decoded.comercioId
    } catch {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }

    // 2. Obtener usuarios vinculados al comercio mediante UsuarioComercio
    const relaciones = await prisma.usuarioComercio.findMany({
      where: { comercioId },
      include: {
        usuario: true, // Datos básicos del usuario (nombre, correo, telefono)
      },
      orderBy: {
        createdAt: 'desc', // Corregido: 'createdAt' en lugar de 'updatedAt'
      },
    })

    let totalClientes = relaciones.length
    let totalPuntosEmitidos = 0
    let totalRedenciones = 0

    const clientesFormateados = relaciones.map((rel) => {
      const u = rel.usuario || {}
      const puntos = rel.puntos || 0
      totalPuntosEmitidos += puntos

      // Valores seguros derivados
      const totalCompras = rel.totalCompras || rel.visitas || 0
      const numRedenciones = rel.totalRedenciones || 0
      totalRedenciones += numRedenciones

      const ultimaVisita = rel.createdAt

      // Clasificación de segmento (RFM)
      let segmento = 'Frecuente'
      const diasSinVisita = ultimaVisita 
        ? Math.floor((new Date() - new Date(ultimaVisita)) / (1000 * 60 * 60 * 24))
        : 0

      if (puntos >= 300 || totalCompras >= 10) {
        segmento = 'VIP'
      } else if (diasSinVisita > 30) {
        segmento = 'En Riesgo'
      } else if (totalCompras <= 2) {
        segmento = 'Nuevo'
      }

      return {
        id: u.id || rel.id,
        nombre: u.nombre || 'Sin nombre',
        correo: u.correo || 'Sin correo',
        telefono: u.telefono || 'Sin teléfono',
        puntos: puntos,
        totalCompras: totalCompras,
        totalRedenciones: numRedenciones,
        ultimaVisita: ultimaVisita,
        diasSinVisita: diasSinVisita,
        segmento: segmento,
      }
    })

    return NextResponse.json({
      success: true,
      kpis: {
        totalClientes,
        totalPuntosEmitidos,
        totalRedenciones,
      },
      clientes: clientesFormateados,
    })
  } catch (error) {
    console.error('=== ERROR EN RESUMEN DE CLIENTES ===', error)
    return NextResponse.json({ error: 'Error interno del servidor', detalle: error.message }, { status: 500 })
  }
}