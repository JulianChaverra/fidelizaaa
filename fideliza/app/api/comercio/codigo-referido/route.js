import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET;

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

    // Decodifica token y extrae comercioId
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    const comercioId = payload.comercioId;

    if (!comercioId) return NextResponse.json({ error: "Token sin comercioId" }, { status: 401 });

    // Busca el comercio por ID (mejor práctica)
    const comercio = await prisma.comercio.findUnique({ where: { id: comercioId } });
    if (!comercio) return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 });

    // Busca el código de referido propio del comercio (tipo: "comercio")
    const codigo = await prisma.codigoReferido.findFirst({
      where: { comercioId: comercio.id, tipo: "comercio", activo: true },
      select: { codigo: true }
    });

    if (!codigo) return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });

    return NextResponse.json({ success: true, codigo: codigo.codigo });
  } catch (e) {
    console.error("Error en codigo-referido:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
