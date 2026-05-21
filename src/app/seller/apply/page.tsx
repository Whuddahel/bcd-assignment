"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Store, Upload, ArrowRight, CheckCircle, Shield, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GradientText } from "@/components/brand/gradient-text"
import { HeroBlobBackground } from "@/components/brand/gradient-blob"
import { toast } from "sonner"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const perks = [
  { icon: Shield,    label: "Vetted & verified",    sub: "Gain the verified badge customers trust" },
  { icon: Star,      label: "Premium placement",    sub: "Featured in curated collections"         },
  { icon: TrendingUp,label: "Stripe payouts",       sub: "Receive funds within 7 business days"   },
]

export default function SellerApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    businessName: "", specialty: "", bio: "", website: "", instagram: "",
    yearsExperience: "", revenue: "", kycDoc: null as File | null,
  })

  function update<K extends keyof typeof form>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSaving(false)
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
          <h1 className="font-display text-2xl font-bold">Application submitted!</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Our team will review your application within{" "}
            <strong className="text-foreground">48 hours</strong>. You&apos;ll receive an email
            with next steps — including Stripe Connect onboarding.
          </p>
          <div className="mt-6 space-y-2 text-left">
            {["ID verification review", "Stripe Connect setup email", "Seller account activation", "First listing goes live"].map((step, i) => (
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
            ✦ Join Aureon
          </p>
          <h1
            className="font-display font-bold tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Become a <GradientText animated>Seller</GradientText>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Aureon is an invite-and-apply marketplace. We vet every seller to maintain the
            highest standard of authenticity for our collectors.
          </p>
        </motion.div>

        {/* Perks */}
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

              <div className="space-y-1.5">
                <Label htmlFor="specialty" className="text-xs text-muted-foreground">
                  Primary specialty <span className="text-red-400">*</span>
                </Label>
                <select
                  id="specialty"
                  value={form.specialty}
                  onChange={update("specialty")}
                  required
                  className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                >
                  <option value="">Select specialty</option>
                  {["Watches", "Fine Art", "Designer", "Rare Items", "Jewellery", "Collectibles"].map(
                    (s) => <option key={s} value={s}>{s}</option>,
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="yearsExperience" className="text-xs text-muted-foreground">
                  Years of experience
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="60"
                  value={form.yearsExperience}
                  onChange={update("yearsExperience")}
                  placeholder="e.g. 8"
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

          {/* KYC document upload */}
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

          {/* Stripe Connect notice */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-xs text-muted-foreground">
              Once approved, you&apos;ll receive a{" "}
              <strong className="text-foreground">Stripe Connect Express</strong> onboarding link
              to set up payouts. Aureon charges a{" "}
              <strong className="text-foreground">10% platform fee</strong> on each successful
              sale. Payouts within 7 business days of delivery confirmation.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              size="lg"
              className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
            >
              {saving ? (
                "Submitting…"
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
