// /app/api/comercio/mis-referidos/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET;

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    const comercioId = payload.comercioId;
    if (!comercioId) return NextResponse.json({ error: "Token sin comercioId" }, { status: 401 });

    // Busca los comercios referidos por este comercio
    const referidos = await prisma.referidoComercio.findMany({
      where: { comercioReferenteId: comercioId },
      orderBy: { createdAt: 'desc' },
      include: {
        comercioReferido: {
          select: {
            nombre: true,
            slug: true,
            fechaPago: true,
            fechaVencimiento: true,
            createdAt: true
          }
        }
      }
    });

    const lista = referidos.map(r => ({
      nombre: r.comercioReferido.nombre,
      slug: r.comercioReferido.slug,
      fechaRegistro: r.comercioReferido.createdAt,
      fechaPago: r.comercioReferido.fechaPago,
      fechaVencimiento: r.comercioReferido.fechaVencimiento
    }));

    return NextResponse.json({ success: true, referidos: lista });
  } catch (e) {
    console.error("Error en mis-referidos:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
