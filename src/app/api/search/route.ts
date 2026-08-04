import { NextResponse, type NextRequest } from "next/server"
import { getProducts, getTrendingProducts } from "@/lib/data/products"
import { getCategories } from "@/lib/data/categories"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""

  // No query yet — this is the search modal's initial-open state, so hand
  // back trending products (same definition as the homepage) instead of an
  // actual search.
  if (q.length === 0) {
    const trending = await getTrendingProducts()
    return NextResponse.json({
      products: trending.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        sellerName: p.sellerName,
        gradient: p.gradient,
        price: p.price,
      })),
      categories: [],
    })
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
