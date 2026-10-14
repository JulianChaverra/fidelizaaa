// /app/api/usuario/comercios/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

export async function POST(req) {
    const prisma = new PrismaClient()
  try {
    const { usuarioId } = await req.json();

    if (!usuarioId) {
      return NextResponse.json({ error: "Falta usuarioId" }, { status: 400 });
    }

    // Busca todos los comercios donde el usuario está afiliado
    // Ajusta según tu modelo de datos (ejemplo: tabla UsuarioComercio)
    const usuarioComercios = await prisma.usuarioComercio.findMany({
      where: { usuarioId },
      select: { comercio: { select: { slug: true, id: true } } }
    });

    // Puedes devolver los slugs o los IDs, según prefieras
    const comercios = usuarioComercios.map(
      (uc) => uc.comercio.slug // o uc.comercio.id
    );

    return NextResponse.json({ comercios });
  } catch (error) {
    console.error("Error usuario/comercios", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
