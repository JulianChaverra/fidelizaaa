import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()
const INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET

export async function POST(req) {
  try {
    const body = await req.json()
    const { comercioId } = body

    if (!INTEGRITY_SECRET) {
      console.error("❌ WOMPI_INTEGRITY_SECRET no está definida en el entorno")
      return NextResponse.json({ error: "Integridad no configurada en el backend" }, { status: 500 })
    }
    if (!comercioId) {
      return NextResponse.json({ error: "ComercioId es requerido" }, { status: 400 })
    }

    // 1. Trae el comercio y cuenta los usuarios afiliados (ajusta el include si es necesario)
    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId },
      include: {
        usuarios: true // Si tu modelo es usuariosComercio, cambia aquí y en la línea del length
      }
    })
    if (!comercio) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    // 2. Calcula usuarios activos (ajusta según tu modelo real)
    const usuariosActuales = comercio.usuarios?.length || 0

    // 3. Busca la tarifa que le corresponde según los usuarios actuales
    const tarifa = await prisma.tarifaComercio.findFirst({
      where: {
        minUsuarios: { lte: usuariosActuales },
        maxUsuarios: { gte: usuariosActuales }
      }
    })
    if (!tarifa) {
      return NextResponse.json({ error: 'No hay tarifa configurada para este número de usuarios' }, { status: 400 })
    }

    const monto = tarifa.valorMensual
    const amountInCents = monto * 100 // siempre en centavos

    // 4. Crea el registro de pago pendiente
    const pago = await prisma.pagoComercio.create({
      data: {
        comercioId,
        monto, // en pesos, solo para tu historial
        moneda: 'COP',
        metodo: 'wompi',
        wompiEstado: 'PENDING',
        observacion: `Pago mensual - ${tarifa.nombre}`
      }
    })

    // 5. Genera la firma de integridad para Wompi
    const reference = pago.id // referencia única por pago
    const currency = 'COP'

    const signature = crypto.createHash('sha256')
      .update(reference + amountInCents + currency + INTEGRITY_SECRET)
      .digest('hex');

    return NextResponse.json({
      reference,
      amountInCents,
      currency,
      signature,
      pagoId: pago.id,
      monto,
      nombreTarifa: tarifa.nombre,
      usuariosActuales,
      minUsuariosTarifa: tarifa.minUsuarios,
      maxUsuariosTarifa: tarifa.maxUsuarios
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creando pago' }, { status: 500 })
  }
}
