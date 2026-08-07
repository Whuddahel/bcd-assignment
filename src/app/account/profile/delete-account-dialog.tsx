"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteAccount } from "@/lib/actions/account"

const CONFIRM_WORD = "DELETE"

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await deleteAccount()

    if (!res.ok) {
      setDeleting(false)
      toast.error(res.error)
      return
    }

    toast.success(res.message ?? "Your account has been deleted.")
    // Full reload rather than a router push — every cached query and store in
    // the tab belongs to a session that no longer exists.
    window.location.href = "/"
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (deleting) return
        setOpen(next)
        if (!next) setConfirmation("")
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Delete account
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-card border-red-500/20 sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm">
              <p>
                Your profile, saved items, cart and notifications are erased, and you
                will be signed out immediately. This cannot be undone.
              </p>
              <p>
                Past orders are kept as anonymous records — tax and buyer-protection
                rules require them — but nothing in them identifies you.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="delete-confirm" className="text-xs text-muted-foreground">
            Type <span className="font-semibold text-foreground">{CONFIRM_WORD}</span> to confirm
          </Label>
          <Input
            id="delete-confirm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            placeholder={CONFIRM_WORD}
            className="border-white/10 bg-white/5 focus-visible:ring-red-500/50"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => setOpen(false)}
            className="border-white/10"
          >
            Keep my account
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting || confirmation.trim() !== CONFIRM_WORD}
            className="gap-2 bg-red-500 text-white hover:bg-red-500/90"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deleting…" : "Delete account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
