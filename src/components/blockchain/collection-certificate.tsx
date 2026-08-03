"use client"

import { useState } from "react"
import { ChevronDown, ShieldCheck, ShieldQuestion, BadgeCheck, Loader2, Sparkles, ArrowRightLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProvenance } from "@/lib/blockchain/hooks/useProvenance"
import { addressForUser, truncateAddress } from "@/lib/blockchain/identity"
import { cn } from "@/lib/utils"

function formatTs(unixSeconds: number): string {
  if (!unixSeconds) return "—"
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

/**
 * On-chain certificate row shown under each item in My Collection. Confirms the
 * logged-in user is the current owner and expands to the full certificate.
 */
export function CollectionCertificate({
  tokenId,
  userId,
}: {
  tokenId?: string | null
  userId: string
}) {
  const { data, loading } = useProvenance(tokenId)
  const [open, setOpen] = useState(false)

  if (!tokenId) {
    return (
      <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <ShieldQuestion className="h-3 w-3 text-muted-foreground/50" />
        Blockchain certificate: <span className="text-muted-foreground/70">Not yet minted</span>
      </p>
    )
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
        Verifying on-chain ownership…
      </p>
    )
  }

  if (!data) {
    return (
      <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <ShieldQuestion className="h-3 w-3 text-muted-foreground/50" />
        Blockchain certificate unavailable (node offline).
      </p>
    )
  }

  const myAddress = addressForUser(userId).toLowerCase()
  const verified = data.owner?.toLowerCase() === myAddress
  const attested = data.attestation.exists

  return (
    <div className="text-[10px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-muted-foreground transition-colors hover:text-foreground"
      >
        {verified ? (
          <BadgeCheck className="h-3 w-3 text-emerald-400" />
        ) : (
          <ShieldQuestion className="h-3 w-3 text-amber-400" />
        )}
        <span>
          Token <span className="font-mono text-violet-300">#{tokenId}</span>
          {verified ? (
            <span className="ml-1 text-emerald-400">· ownership verified on-chain</span>
          ) : (
            <span className="ml-1 text-amber-400">· ownership pending transfer</span>
          )}
        </span>
        {attested && (
          <Badge className="ml-1 gap-0.5 border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0 text-[9px] text-emerald-300">
            <ShieldCheck className="h-2.5 w-2.5" /> Authentic
          </Badge>
        )}
        <ChevronDown
          className={cn("ml-auto h-3 w-3 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/2 p-3">
          {attested ? (
            <div className="mb-3 flex items-start gap-2 rounded border border-emerald-500/15 bg-emerald-500/5 p-2">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
              <div className="text-[10px] text-muted-foreground">
                Certified authentic by{" "}
                <span className="font-mono text-emerald-300">
                  {truncateAddress(data.attestation.attestor)}
                </span>{" "}
                on {formatTs(data.attestation.timestamp)}.
                <span className="mt-0.5 block break-all font-mono text-[9px] text-muted-foreground/60">
                  {data.attestation.certHash}
                </span>
              </div>
            </div>
          ) : (
            <p className="mb-3 text-[10px] text-amber-300/80">Authenticity attestation pending.</p>
          )}

          <p className="mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
            Chain of custody
          </p>
          <ol className="relative space-y-2.5 border-l border-white/10 pl-4">
            {data.events.map((ev, i) => {
              const isMint = ev.event === "Minted"
              return (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[22px] flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-midnight",
                      isMint ? "bg-violet-500" : "bg-pink-500",
                    )}
                  >
                    {isMint ? (
                      <Sparkles className="h-1.5 w-1.5 text-white" />
                    ) : (
                      <ArrowRightLeft className="h-1.5 w-1.5 text-white" />
                    )}
                  </span>
                  <span className="text-foreground">
                    {isMint ? "Minted" : "Transferred"}
                  </span>{" "}
                  <span className="font-mono text-muted-foreground">
                    {truncateAddress(ev.owner)}
                  </span>
                  <span className="ml-1 text-muted-foreground/60">· {formatTs(ev.timestamp)}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
