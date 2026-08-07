"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Store, Upload, ArrowRight, CheckCircle, Shield, Star, TrendingUp, ImageIcon, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GradientText } from "@/components/brand/gradient-text"
import { HeroBlobBackground } from "@/components/brand/gradient-blob"
import { applyAsSeller, updateSellerProfile } from "@/lib/actions/seller"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { SellerVM } from "@/lib/data/types"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const perks = [
  { icon: Shield,    label: "Vetted & verified",    sub: "Gain the verified badge customers trust" },
  { icon: Star,      label: "Premium placement",    sub: "Featured in curated collections"         },
  { icon: TrendingUp,label: "Stripe payouts",       sub: "Funds transfer automatically the moment a sale is confirmed" },
]

/** Storefront images live alongside profile pictures in the public `avatars` bucket. */
const BRANDING_BUCKET = "avatars"

export function SellerApplyClient({ existing }: { existing: SellerVM | null }) {
  const isEditing = Boolean(existing)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null)
  const [form, setForm] = useState({
    businessName: existing?.businessName ?? "",
    bio: existing?.description ?? "",
    website: existing?.websiteUrl ?? "",
    instagram: existing?.instagramUrl ?? "",
    logoUrl: existing?.logoUrl ?? "",
    bannerUrl: existing?.bannerUrl ?? "",
  })

  function update<K extends keyof typeof form>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function uploadBranding(kind: "logo" | "banner", file: File) {
    setUploading(kind)
    const supabase = createSupabaseBrowserClient()

    const ext = file.name.split(".").pop() ?? "png"
    const fileName = `seller-${kind}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage.from(BRANDING_BUCKET).upload(fileName, file)
    if (error) {
      setUploading(null)
      toast.error("Upload failed", { description: error.message })
      return
    }

    const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(fileName)
    setForm((f) => ({ ...f, [kind === "logo" ? "logoUrl" : "bannerUrl"]: data.publicUrl }))
    setUploading(null)
    toast.success(`${kind === "logo" ? "Logo" : "Banner"} uploaded — remember to save.`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const instagram = form.instagram.trim()
    const instagramUrl = instagram
      ? instagram.startsWith("http")
        ? instagram
        : `https://instagram.com/${instagram.replace(/^@/, "")}`
      : ""

    const payload = {
      businessName: form.businessName,
      description: form.bio,
      websiteUrl: form.website.trim(),
      instagramUrl,
      logoUrl: form.logoUrl,
      bannerUrl: form.bannerUrl,
    }
    const res = isEditing ? await updateSellerProfile(payload) : await applyAsSeller(payload)
    setSaving(false)

    if (!res.ok) {
      toast.error(res.error, {
        description: res.fieldErrors ? Object.values(res.fieldErrors)[0] : undefined,
      })
      return
    }

    if (isEditing) {
      toast.success("Business profile updated")
      return
    }

    setSubmitted(true)
    toast.success("Application submitted!", {
      description: "Our team reviews applications within 48 hours.",
    })
  }

  if (submitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight px-4 py-24">
        <HeroBlobBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="glass-card relative z-10 mx-auto w-full max-w-md rounded-3xl p-10 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-brand">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">Application Submitted!</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Your application has been submitted! Further assessments from our team will occur within{" "}
            <strong className="text-foreground">48 hours</strong> to ensure it doesn&apos;t violate our policies.
          </p>
          {/* You&apos;ll receive an email
            with next steps — including Stripe Connect onboarding. */}
          <div className="mt-6 space-y-2 text-left">
            {["Application review", "Stripe Connect setup email", "Seller account activation", "First listing goes live"].map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-violet-400">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-midnight">
      <HeroBlobBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand">
            <Store className="h-8 w-8 text-white" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
            {isEditing ? "✦ Seller Hub" : "✦ Join Aureon"}
          </p>
          <h1
            className="font-display font-bold tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            {isEditing ? (
              <>Business <GradientText animated>Profile</GradientText></>
            ) : (
              <>Become a <GradientText animated>Seller</GradientText></>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            {isEditing
              ? "Update the business details buyers see on your storefront and listings."
              : "Aureon is an invite-and-apply marketplace. We vet every seller to maintain the highest standard of authenticity for our collectors."}
          </p>
        </motion.div>

        {/* Perks — prospective sellers only */}
        {!isEditing && (
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {perks.map(({ icon: Icon, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: EASE }}
                className="glass-card rounded-2xl p-5 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Business info */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-5 text-sm font-semibold text-foreground">Business information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="businessName" className="text-xs text-muted-foreground">
                  Business / store name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={form.businessName}
                  onChange={update("businessName")}
                  placeholder="e.g. WatchVault Geneva"
                  required
                  className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bio" className="text-xs text-muted-foreground">
                  Tell us about you & your inventory <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={update("bio")}
                  required
                  rows={4}
                  placeholder="Describe your expertise, sourcing, and types of items you'd like to sell on Aureon…"
                  className="resize-none border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-xs text-muted-foreground">Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={update("website")}
                  placeholder="https://your-store.com"
                  className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instagram" className="text-xs text-muted-foreground">Instagram handle (optional)</Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={update("instagram")}
                  placeholder="@yourstore"
                  className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>
          </div>

          {/* Storefront branding */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-1 text-sm font-semibold text-foreground">Storefront branding</h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Your logo and banner appear on your public seller page and in the seller directory.
              Optional — buyers see your initial on a gradient until you add a logo.
            </p>

            {/* Banner preview + picker */}
            <div className="relative mb-5 h-36 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-600/30 via-pink-600/15 to-midnight-100">
              {form.bannerUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.bannerUrl} alt="Storefront banner" className="h-full w-full object-cover" />
              )}

              <div className="absolute bottom-3 right-3 flex gap-2">
                {form.bannerUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, bannerUrl: "" }))}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:text-white"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                )}
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:text-white">
                  {uploading === "banner" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  {form.bannerUrl ? "Replace banner" : "Upload banner"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadBranding("banner", file)
                      e.target.value = ""
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Logo preview + picker */}
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl gradient-brand text-2xl font-bold text-white shadow-lg">
                {form.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={form.logoUrl} alt="Storefront logo" className="h-full w-full object-cover" />
                ) : (
                  (form.businessName.trim()[0]?.toUpperCase() ?? "?")
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
                  {uploading === "logo" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {form.logoUrl ? "Replace logo" : "Upload logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadBranding("logo", file)
                      e.target.value = ""
                    }}
                  />
                </label>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" /> Remove logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* KYC document upload — onboarding only, already on file for existing sellers */}
          {/* {!isEditing && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="mb-2 text-sm font-semibold text-foreground">Identity verification</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Upload a government-issued ID (passport or driving licence). Required for Stripe
                Connect KYC — stored securely via Supabase Storage.
              </p>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/2 py-8 transition-all hover:border-violet-500/40 hover:bg-violet-500/5"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Upload ID document</p>
                  <p className="text-xs text-muted-foreground/60">PDF, JPG, PNG · Max 10MB</p>
                </div>
              </button>
            </div>
          )} */}

          {/* Stripe Connect notice — onboarding only */}
          {!isEditing && (
            <div id="pricing" className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="text-xs text-muted-foreground">
                Once approved, you&apos;ll receive a{" "}
                <strong className="text-foreground">Stripe Connect</strong> onboarding link
                to set up payouts. Aureon charges a{" "}
                <strong className="text-foreground">10% platform fee</strong> on each successful
                sale — your share transfers to your connected account automatically as soon as
                the sale is confirmed. Finish Stripe onboarding first, or payouts are held until
                you do.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              size="lg"
              className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
            >
              {saving ? (
                isEditing ? "Saving…" : "Submitting…"
              ) : isEditing ? (
                <>
                  Save changes <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Submit application <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
