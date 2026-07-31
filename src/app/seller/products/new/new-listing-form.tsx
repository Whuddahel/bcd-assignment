"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GradientText } from "@/components/brand/gradient-text"
import type { CategoryVM } from "@/lib/data/types"
import { createProduct } from "@/lib/actions/products"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const CONDITIONS = ["mint", "excellent", "very_good", "good", "fair"] as const

export function NewListingForm({ categories }: { categories: CategoryVM[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "", category: "", condition: "excellent" as (typeof CONDITIONS)[number],
    price: "", description: "", imageUrl: "",
  })

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function submit(status: "draft" | "pending_review") {
    if (!form.title || !form.category || !form.price) {
      toast.error("Title, category, and price are required.")
      return
    }
    setSaving(true)
    const res = await createProduct({
      title: form.title,
      description: form.description,
      categoryId: form.category,
      condition: form.condition,
      price: Number(form.price),
      status,
      imageUrl: form.imageUrl.trim() || undefined,
    })
    setSaving(false)

    if (!res.ok) {
      toast.error(res.error, {
        description: res.fieldErrors ? Object.values(res.fieldErrors)[0] : undefined,
      })
      return
    }
    toast.success(
      status === "draft" ? "Draft saved" : "Listing submitted for review",
      { description: status === "draft" ? undefined : "We'll notify you once it's approved." },
    )
    router.push("/seller/products")
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">New <GradientText>Listing</GradientText></h1>
        <p className="mt-1 text-sm text-muted-foreground">All listings are reviewed before going live (usually within 24 hours).</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void submit("pending_review") }} className="space-y-6">
        {/* Images */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Photos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              className="col-span-2 flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/2 transition-all hover:border-violet-500/40 hover:bg-violet-500/5 sm:col-span-2"
            >
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">Main photo</p>
                <p className="text-xs text-muted-foreground/60">Paste an image URL below</p>
              </div>
            </button>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/2 transition-all hover:border-white/20"
              >
                <Upload className="h-5 w-5 text-muted-foreground/40" />
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="imageUrl" className="text-xs text-muted-foreground">Cover image URL (optional)</Label>
            <Input id="imageUrl" type="url" placeholder="https://…" value={form.imageUrl} onChange={update("imageUrl")} className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50" />
          </div>
        </div>

        {/* Basic info */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-semibold text-foreground">Item Details</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs text-muted-foreground">Title <span className="text-red-400">*</span></Label>
              <Input id="title" placeholder="e.g. Patek Philippe Nautilus 5711/1A" value={form.title} onChange={update("title")} required className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs text-muted-foreground">Category <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <select
                    id="category"
                    value={form.category}
                    onChange={update("category")}
                    required
                    className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs text-muted-foreground">Ask Price (USD) <span className="text-red-400">*</span></Label>
                <Input id="price" type="number" min="1" placeholder="e.g. 87500" value={form.price} onChange={update("price")} required className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50" />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Condition <span className="text-red-400">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, condition: c }))}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all",
                      form.condition === c
                        ? "gradient-brand text-white"
                        : "border border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground",
                    )}
                  >
                    {c.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
              <Textarea id="description" placeholder="Describe the item's history, provenance, included accessories…" value={form.description} onChange={update("description")} rows={4} className="resize-none border-white/10 bg-white/5 focus-visible:ring-violet-500/50" />
            </div>
          </div>
        </div>

        {/* Platform fee note */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="text-xs text-muted-foreground">
            Aureon charges a <strong className="text-foreground">10% platform fee</strong> on each successful sale. Payment is processed via Stripe Connect. You receive funds within 7 business days of delivery.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={saving} onClick={() => void submit("draft")} className="border-white/10 hover:bg-white/5">
            Save draft
          </Button>
          <Button type="submit" disabled={saving} className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90">
            {saving ? "Submitting…" : <>Submit for review <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </form>
    </div>
  )
}
