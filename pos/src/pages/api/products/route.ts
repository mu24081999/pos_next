import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
  });

  return Response.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      ...body,
    },
  });

  return Response.json(product);
}
