import { prisma } from "@/lib/prisma";

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
