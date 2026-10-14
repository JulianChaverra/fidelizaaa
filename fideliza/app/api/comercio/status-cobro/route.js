import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { jwtDecode } from "jwt-decode"

const prisma = new PrismaClient()
const DIAS_EXENCION = 30
const DIAS_ALERTA_RENOVACION = 8
const USUARIOS_EXENCION = 100 // Límite de usuarios en periodo gratis

export async function POST(req) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ success: false, error: "Token requerido" }, { status: 400 })

    // Decodifica el token JWT seguro
    let comercioId = null
    try {
      const payload = jwtDecode(token)
      comercioId = payload.comercioId
      if (!comercioId) throw new Error("Token inválido")
    } catch {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 400 })
    }

    // Busca el comercio y datos de suscripción
    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId },
      select: {
        nombre: true,
        esExentoDeCobro: true,
        activo: true,
        fechaVencimiento: true,
        fechaPago: true,
        id: true
      }
    })
    if (!comercio) return NextResponse.json({ success: false, error: "Comercio no encontrado" }, { status: 404 })

    // Cuenta usuarios actuales
    const usuariosActuales = await prisma.usuarioComercio.count({
      where: { comercioId: comercio.id }
    })

    // Obtiene la tarifa que aplica a este comercio (según # usuarios)
    const tarifa = await prisma.tarifaComercio.findFirst({
      where: {
        minUsuarios: { lte: usuariosActuales },
        maxUsuarios: { gte: usuariosActuales }
      },
      orderBy: { minUsuarios: "asc" }
    })

    // Si no hay plan, toma el básico por defecto
    const tarifaBasica = await prisma.tarifaComercio.findFirst({
      orderBy: { minUsuarios: "asc" }
    })
    const plan = tarifa || tarifaBasica

    // Estado de exención (si tiene el flag y no ha llegado al límite)
    let mostrarBannerGratis = false
    let requierePagoFideliza = false
    let vencido = false
    let mostrarAlertaRenovacion = false
    let diasRestantes = null

    // Fecha de vencimiento
    let fechaVencimiento = comercio.fechaVencimiento

    // ¿Está exento por código?
    if (comercio.esExentoDeCobro) {
      if (usuariosActuales < USUARIOS_EXENCION) {
        // Sigue en exención
        mostrarBannerGratis = true
        requierePagoFideliza = false
      } else {
        // Debe pagar porque superó usuarios
        mostrarBannerGratis = false
        requierePagoFideliza = true
        // Si nunca ha tenido fechaVencimiento, le damos 8 días extra para pagar
        if (!fechaVencimiento) {
          const fechaDesdeAhora = new Date()
          fechaDesdeAhora.setDate(fechaDesdeAhora.getDate() + DIAS_ALERTA_RENOVACION)
          fechaVencimiento = fechaDesdeAhora
        }
      }
    } else {
      requierePagoFideliza = false
    }

    // Estado normal (no exento)
    if (!comercio.esExentoDeCobro) {
      if (fechaVencimiento) {
        const ahora = new Date()
        const diffMs = new Date(fechaVencimiento) - ahora
        diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        if (diasRestantes <= 0) {
          vencido = true
        } else if (diasRestantes <= DIAS_ALERTA_RENOVACION) {
          mostrarAlertaRenovacion = true
        }
      } else {
        vencido = true
      }
    }

    // Si acaba de vencer por superar usuarios, fuerza vencimiento
    if (requierePagoFideliza && fechaVencimiento) {
      const ahora = new Date()
      const diffMs = new Date(fechaVencimiento) - ahora
      diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (diasRestantes <= 0) {
        vencido = true
      } else if (diasRestantes <= DIAS_ALERTA_RENOVACION) {
        mostrarAlertaRenovacion = true
      }
    }

    // Plan actual info para mostrar
    const planActual = {
      nombreTarifa: plan?.nombre || "Plan Básico",
      minUsuariosTarifa: plan?.minUsuarios || 1,
      maxUsuariosTarifa: plan?.maxUsuarios || 200,
      monto: plan?.valorMensual || 24900,
      usuariosActuales
    }

    return NextResponse.json({
      success: true,
      nombreComercio: comercio.nombre,
      esExentoDeCobro: comercio.esExentoDeCobro,
      usuariosActuales,
      maxUsuariosGratis: USUARIOS_EXENCION,
      requierePagoFideliza,
      activo: comercio.activo,
      fechaVencimiento,
      diasRestantes,
      mostrarAlertaRenovacion,
      mostrarBannerGratis,
      mostrarBannerPago: requierePagoFideliza,
      vencido,
      planActual
    })
  } catch (e) {
    console.error("Error en status-cobro:", e)
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
  }
}
