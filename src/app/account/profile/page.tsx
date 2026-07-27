"use client"

import { useState, useEffect } from "react"
import { Camera, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { GradientText } from "@/components/brand/gradient-text"
import { toast } from "sonner"
import { useUser } from "@/hooks/use-user"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const [saving, setSaving] = useState(false)
  const { user } = useUser() // <-- Get the logged-in user

  // 1. Start with empty/fallback fields
  const [form, setForm] = useState({
    name:    "",
    email:   "",
    bio:     "",
    phone:   "",
    avatarUrl: "",
    //address: "",
  })

  // 2. Fetch the actual profile data when the component loads
  useEffect(() => {
    if (!user) return; // Wait until the user is loaded

    async function loadProfile() {
      const supabase = createSupabaseBrowserClient()
      
      // Fetch the extra details from the "profiles" database table
      const { data: profile } = await supabase
        .from("profiles")
        .select("bio, phone, avatar_url")
        .eq("id", user!.id)
        .single()

      // Update the form with the user's real data!
      setForm({
        name: user?.fullName || "",
        email: user?.email || "",
        bio: profile?.bio || "",
        phone: profile?.phone || "",
        avatarUrl: profile?.avatar_url || "",
        //address: "", // (is not used at the moment)
      })
    }

    loadProfile()
  }, [user])


  // When they press save
  async function handleSave(e: React.FormEvent) {
    e.preventDefault() // Prevent browser from refresh the page

    if (!user) return // Stop if userless 
    setSaving(true)
    
    const supabase = createSupabaseBrowserClient() // Setup supabase

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.name, // The database column is 'full_name', but our state is 'name'
        bio: form.bio,
        phone: form.phone,
        avatar_url: form.avatarUrl, // Save the avatar URL!
      })
      .eq("id", user.id)

    setSaving(false)

    // Handle the result
    if (error) {
      toast.error("Failed to save changes: " + error.message)
    } else {
      toast.success("Profile updated")
      window.location.reload() // Force a refresh so the new avatar propagates to the dashboard
    }
  }

  // fields
  function field(id: keyof typeof form, label: string, type = "text") {
    const isEmail = id === "email";
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
        <Input
          id={id}
          type={type}
          value={form[id]}
          //onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
          onChange={e => {
            let value = e.target.value
            
            // if phone field, use regex to strip invalid characters
            if (id === "phone") {
              value = value.replace(/[^\d\s\+\-\(\)]/g, "")
            }
            setForm(f => ({ ...f, [id]: value }))
          }}
          disabled={isEmail}
          className={`border-white/10 bg-white/5 focus-visible:ring-violet-500/50 ${
            isEmail ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      </div>
    )
  }

  // Upload image function
  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    toast.loading("Uploading image...")
    const supabase = createSupabaseBrowserClient()
    
    // Create a unique file name using the user's ID
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    // 1. Upload to Supabase Storage bucket named "avatars"
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)
    if (uploadError) {
      toast.dismiss()
      toast.error("Upload failed: " + uploadError.message)
      return
    }
    // 2. Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    // 3. Update our form state to immediately show the image
    setForm(f => ({ ...f, avatarUrl: publicUrl }))
    
    toast.dismiss()
    toast.success("Image uploaded! Remember to save changes.")
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
              <div className="flex h-20 w-20 overflow-hidden items-center justify-center rounded-2xl gradient-brand text-3xl font-bold text-white shadow-lg">
                {/* Display the image if they have one, otherwise show initials */}
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  form.name?.[0]?.toUpperCase() || "?"
                )}
              </div>
              
              {/* Hidden file input wrapped inside a label button */}
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-midnight-100 text-muted-foreground transition-colors hover:text-foreground">
                <Camera className="h-3.5 w-3.5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={uploadAvatar} 
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-foreground">{form.name}</p>
              <p className="text-sm text-muted-foreground">{form.email}</p>
              <p className="mt-1 text-xs text-violet-400 capitalize">{user?.role || "Customer"} · Verified</p>
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

        {/* Shipping address
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
        </div> */}

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
