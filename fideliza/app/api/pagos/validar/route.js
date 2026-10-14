import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Instancia de Prisma (ajusta si usas singleton)
const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { reference } = await req.json()

    if (!reference) {
      return NextResponse.json({ success: false, error: "Referencia no recibida." }, { status: 400 })
    }

    // Busca el pago por referencia (el id en tu modelo PagoComercio)
    const pago = await prisma.pagoComercio.findUnique({
      where: { id: reference },
      select: {
        id: true,
        wompiEstado: true,
        fechaPago: true,
        comercioId: true,
        updatedAt: true,
        wompiDetalles: true,
        moneda: true,
        monto: true,
        metodo: true
      }
    })

    if (!pago) {
      return NextResponse.json({ success: false, error: "Pago no encontrado." }, { status: 404 })
    }

    // Si tu webhook ya actualiza wompiEstado, bastará con eso.
    // Opcional: Validar con la API de Wompi si el estado es "PENDING"
    // (Aquí sólo retornamos el estado actual en tu BD)
    return NextResponse.json({
      success: true,
      estado: pago.wompiEstado, // "APPROVED", "PENDING", "DECLINED", etc.
      comercioId: pago.comercioId
    })

  } catch (error) {
    console.error("Error validando pago:", error)
    return NextResponse.json({ success: false, error: "Error validando pago" }, { status: 500 })
  }
}
