"use client"

import { useState } from "react"
import { Camera, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { GradientText } from "@/components/brand/gradient-text"
import { toast } from "sonner"

export default function ProfilePage() {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:    "Emma Wilson",
    email:   "buyer1@aureon.io",
    bio:     "Passionate collector of vintage watches and contemporary art.",
    phone:   "+44 20 7946 0958",
    address: "14 Kensington Gardens, London, W8 4PT",
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success("Profile updated")
  }

  function field(id: keyof typeof form, label: string, type = "text") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
        <Input
          id={id}
          type={type}
          value={form[id]}
          onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
          className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Profile <GradientText>Settings</GradientText></h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-brand text-3xl font-bold text-white shadow-lg">
                E
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-midnight-100 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="font-medium text-foreground">{form.name}</p>
              <p className="text-sm text-muted-foreground">{form.email}</p>
              <p className="mt-1 text-xs text-violet-400">Customer · Verified</p>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-semibold text-foreground">Personal Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("name",  "Full name")}
            {field("email", "Email", "email")}
            {field("phone", "Phone", "tel")}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="bio" className="text-xs text-muted-foreground">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50 resize-none"
            />
          </div>
        </div>

        {/* Shipping address */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-semibold text-foreground">Default Shipping Address</h2>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs text-muted-foreground">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
            />
          </div>
        </div>

        {/* Danger zone */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Account</h2>
          <Separator className="mb-4 bg-white/5" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account and all data.</p>
            </div>
            <Button variant="outline" size="sm" type="button" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Delete account
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
