import { NextResponse, type NextRequest } from "next/server"
import { getProducts } from "@/lib/data/products"
import { getCategories } from "@/lib/data/categories"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length === 0) {
    return NextResponse.json({ products: [], categories: [] })
  }

  const [products, allCategories] = await Promise.all([
    getProducts({ search: q, limit: 6 }),
    getCategories(),
  ])

  const lower = q.toLowerCase()
  const categories = allCategories
    .filter((c) => c.name.toLowerCase().includes(lower))
    .slice(0, 2)
    .map((c) => ({ name: c.name, slug: c.slug }))

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      sellerName: p.sellerName,
      gradient: p.gradient,
      price: p.price,
    })),
    categories,
  })
}
