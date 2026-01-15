import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  const product = await prisma.product.update({
    where: { id: params.id },
    data,
  });

  return Response.json(product);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.product.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return Response.json({ success: true });
}
