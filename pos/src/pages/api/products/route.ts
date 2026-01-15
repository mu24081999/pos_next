import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
  });

  return Response.json(products);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      ...body,
    },
  });

  return Response.json(product);
}
