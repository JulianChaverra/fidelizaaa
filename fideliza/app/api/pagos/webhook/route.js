// /app/api/webhooks/wompi/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    // El evento llega en body.data
    const event = body?.event; // Ej: "transaction.updated"
    const transaction = body?.data?.transaction;
    if (!transaction) return NextResponse.json({ error: "No transaction" }, { status: 400 });

    const { reference, status, id: wompiId } = transaction; // status: "APPROVED", "DECLINED", etc.

    // Busca el pago por referencia (tu id interno del pago)
    const pago = await prisma.pagoComercio.findUnique({
      where: { id: reference }
    });
    if (!pago) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });

    // Actualiza el estado y guarda detalles del pago
    await prisma.pagoComercio.update({
      where: { id: reference },
      data: {
        wompiEstado: status, // "APPROVED", "DECLINED", etc.
        wompiId,
        wompiDetalles: transaction, // Guarda todo el objeto para auditoría
        fechaPago: status === "APPROVED" ? new Date() : null
      }
    });

    // Si el pago fue aprobado, actualiza fecha de vencimiento correctamente
    if (status === "APPROVED") {
      // Busca el comercio actual para obtener fechaVencimiento y código de referido
      const comercio = await prisma.comercio.findUnique({
        where: { id: pago.comercioId },
        select: {
          fechaVencimiento: true,
          codigoReferido: true,
          id: true
        }
      });

      const now = new Date();
      // Si la fecha de vencimiento está en el futuro, suma 30 días desde ahí, si no, desde hoy
      const fechaBase = comercio?.fechaVencimiento && comercio.fechaVencimiento > now
        ? comercio.fechaVencimiento
        : now;
      const nuevaFechaVencimiento = new Date(fechaBase.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.comercio.update({
        where: { id: pago.comercioId },
        data: {
          activo: true,
          fechaPago: now,
          fechaVencimiento: nuevaFechaVencimiento
        }
      });

      // ----- GESTIÓN DE REFERIDOS (solo al aprobar el pago) -----
      if (comercio.codigoReferido) {
        // Busca el código de referido tipo "comercio"
        const codigo = await prisma.codigoReferido.findFirst({
          where: { codigo: comercio.codigoReferido, tipo: "comercio", activo: true },
          select: { comercioId: true }
        });
        // Si el código es válido y no es auto-referido (no se puede referir a sí mismo)
        if (codigo && codigo.comercioId && codigo.comercioId !== comercio.id) {
          // Chequea si ya existe este referido (un comercio solo puede ser contado una vez como referido)
          const yaReferido = await prisma.referidoComercio.findFirst({
            where: {
              comercioReferenteId: codigo.comercioId,
              comercioReferidoId: comercio.id
            }
          });
          if (!yaReferido) {
            // Ahora sí crea el referido y suma el descuento al referente
            await prisma.referidoComercio.create({
              data: {
                comercioReferenteId: codigo.comercioId,
                comercioReferidoId: comercio.id
              }
            });
            await prisma.comercio.update({
              where: { id: codigo.comercioId },
              data: {
                referidosAcumulados: { increment: 1 }
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error webhook wompi:", e);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}
