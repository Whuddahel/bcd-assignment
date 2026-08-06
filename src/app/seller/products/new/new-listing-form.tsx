"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, ArrowRight, ChevronDown, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GradientText } from "@/components/brand/gradient-text"
import type { CategoryVM } from "@/lib/data/types"
import type { ResaleCandidate } from "@/lib/data/orders"
import { createProduct, createResaleListing } from "@/lib/actions/products"
import { cn, formatPrice, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

const CONDITIONS = ["mint", "excellent", "very_good", "good", "fair"] as const

export function NewListingForm({
  categories,
  userId,
  resaleCandidates,
}: {
  categories: CategoryVM[]
  userId: string
  resaleCandidates: ResaleCandidate[]
}) {
  const [mode, setMode] = useState<"new" | "resale">("new")
  const [source, setSource] = useState<ResaleCandidate | null>(null)

  if (mode === "resale") {
    return (
      <ResaleListingFlow
        candidates={resaleCandidates}
        source={source}
        onPickSource={setSource}
        onSwitchMode={() => { setMode("new"); setSource(null) }}
      />
    )
  }

  return (
    <FreshListingForm
      categories={categories}
      userId={userId}
      hasCandidates={resaleCandidates.length > 0}
      onSwitchMode={() => setMode("resale")}
    />
  )
}

function ModeToggle({ mode, onSwitch, resaleAvailable }: { mode: "new" | "resale"; onSwitch: () => void; resaleAvailable: boolean }) {
  if (!resaleAvailable && mode === "new") return null
  return (
    <div className="mb-6 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      <button
        type="button"
        onClick={mode === "resale" ? onSwitch : undefined}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
          mode === "new" ? "gradient-brand text-white" : "text-muted-foreground hover:text-foreground",
        )}
      >
        New item
      </button>
      <button
        type="button"
        onClick={mode === "new" ? onSwitch : undefined}
        disabled={!resaleAvailable}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
          mode === "resale" ? "gradient-brand text-white" : "text-muted-foreground hover:text-foreground disabled:opacity-40",
        )}
      >
        Resell from my collection
      </button>
    </div>
  )
}

function ResaleListingFlow({
  candidates,
  source,
  onPickSource,
  onSwitchMode,
}: {
  candidates: ResaleCandidate[]
  source: ResaleCandidate | null
  onPickSource: (c: ResaleCandidate | null) => void
  onSwitchMode: () => void
}) {
  const router = useRouter()
  const [price, setPrice] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!source || !price) return
    setSaving(true)
    const res = await createResaleListing({ sourceOrderItemId: source.orderItemId, price: Number(price) })
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error, { description: res.fieldErrors ? Object.values(res.fieldErrors)[0] : undefined })
      return
    }
    toast.success("Resale listing submitted for review")
    router.push("/seller/products")
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">New <GradientText>Listing</GradientText></h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Relist an item from your own collection — the details, photos, and any existing digital twin carry over automatically.
        </p>
      </div>

      <ModeToggle mode="resale" onSwitch={onSwitchMode} resaleAvailable />

      {!source ? (
        candidates.length === 0 ? (
          <div className="glass-card rounded-2xl py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">Nothing available to resell</p>
            <p className="mt-1 text-xs text-muted-foreground">Items you've purchased and received appear here once they aren't already listed.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {candidates.map((c) => (
              <button
                key={c.orderItemId}
                type="button"
                onClick={() => onPickSource(c)}
                className="glass-card flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:border-violet-500/30"
              >
                <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${c.gradient}`}>
                  {c.image && <Image src={c.image} alt={c.title} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Bought {formatDate(c.purchasedDate)} · {formatPrice(c.purchasePrice)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <form onSubmit={submit} className="glass-card max-w-lg rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${source.gradient}`}>
              {source.image && <Image src={source.image} alt={source.title} fill sizes="48px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{source.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Photos, description, and condition are reused as-is.</p>
            </div>
            <button type="button" onClick={() => onPickSource(null)} className="text-xs text-violet-400 hover:text-violet-300">
              Change
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resale-price" className="text-xs text-muted-foreground">Ask Price (USD) <span className="text-red-400">*</span></Label>
            <Input
              id="resale-price"
              type="number"
              min="1"
              placeholder="e.g. 87500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90">
              {saving ? "Submitting…" : <>Submit for review <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function FreshListingForm({
  categories,
  userId,
  hasCandidates,
  onSwitchMode,
}: {
  categories: CategoryVM[]
  userId: string
  hasCandidates: boolean
  onSwitchMode: () => void
}) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: "", category: "", condition: "excellent" as (typeof CONDITIONS)[number],
    price: "", description: "", imageUrl: "",
  })
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    
    // Create a unique file name using the userId and a random string
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random().toString(36).slice(2)}.${fileExt}`
    // Upload to the "products" bucket
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file)
    if (uploadError) {
      toast.error('Error uploading image', { description: uploadError.message })
      setUploading(false)
      return
    }
    // Get the public URL and update the form state
    const { data } = supabase.storage.from('products').getPublicUrl(fileName)
    setForm((f) => ({ ...f, imageUrl: data.publicUrl }))
    setUploading(false)
  }

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

    // Convert [{key: "Brand", value: "Rolex"}] into {"Brand": "Rolex"}
    const attributesRecord: Record<string, string> = {}
    attributes.forEach((attr) => {
      if (attr.key.trim() && attr.value.trim()) {
        attributesRecord[attr.key.trim()] = attr.value.trim()
      }
    })

    const res = await createProduct({
      title: form.title,
      description: form.description,
      categoryId: form.category,
      condition: form.condition,
      price: Number(form.price),
      status,
      imageUrl: form.imageUrl.trim() || undefined,
      attributes: attributesRecord,
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

      <ModeToggle mode="new" onSwitch={onSwitchMode} resaleAvailable={hasCandidates} />

      <form onSubmit={(e) => { e.preventDefault(); void submit("pending_review") }} className="space-y-6">
        {/* Images */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Photos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <label className="relative col-span-2 flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-white/2 transition-all hover:border-violet-500/40 hover:bg-violet-500/5 sm:col-span-2">
              {form.imageUrl ? (
                <>
                  <img src={form.imageUrl} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-midnight/60 opacity-0 transition-opacity hover:opacity-100">
                    <Upload className="mx-auto h-8 w-8 text-white" />
                    <p className="mt-2 text-sm font-medium text-white">Change photo</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  {uploading ? (
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-400" />
                  ) : (
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  )}
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {uploading ? "Uploading..." : "Upload main photo"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Click to browse your files</p>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
                disabled={uploading}
              />
            </label>

            {/* {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/2 transition-all hover:border-white/20"
              >
                <Upload className="h-5 w-5 text-muted-foreground/40" />
              </button>
            ))} */}
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
                {categories.length === 0 && (
                  <p className="text-[11px] text-red-400">
                    No categories found. Your database may not be seeded — run <code>supabase/seed.sql</code>.
                  </p>
                )}
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

            <div className="space-y-3 pt-4 border-t border-white/5">
              <Label className="text-xs text-muted-foreground">Specifications & Attributes</Label>
              {attributes.map((attr, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="e.g. Brand" 
                    value={attr.key} 
                    onChange={(e) => {
                      const newAttrs = [...attributes];
                      newAttrs[index].key = e.target.value;
                      setAttributes(newAttrs);
                    }} 
                    className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50" 
                  />
                  <Input 
                    placeholder="e.g. Rolex" 
                    value={attr.value} 
                    onChange={(e) => {
                      const newAttrs = [...attributes];
                      newAttrs[index].value = e.target.value;
                      setAttributes(newAttrs);
                    }} 
                    className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50" 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setAttributes(attributes.filter((_, i) => i !== index))}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setAttributes([...attributes, { key: "", value: "" }])}
                className="border-white/10 hover:bg-white/5 text-xs"
              >
                + Add Attribute
              </Button>
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
