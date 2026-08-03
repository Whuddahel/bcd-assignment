"use client"

import { BadgeCheck, ShieldCheck, ShieldQuestion, Link2, Sparkles, ArrowRightLeft, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProvenance } from "@/lib/blockchain/hooks/useProvenance"
import { truncateAddress } from "@/lib/blockchain/identity"
import { cn } from "@/lib/utils"

function formatTs(unixSeconds: number): string {
  if (!unixSeconds) return "—"
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

/**
 * Provenance & Authenticity card for the product detail page. Reads the on-chain
 * ownership chain + attestation for a token and renders a timeline. Falls back
 * gracefully when the product isn't minted or the node is unreachable.
 */
export function ProvenanceCard({ tokenId }: { tokenId?: string | null }) {
  const { data, loading } = useProvenance(tokenId)

  const shell =
    "mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5"

  // ── Loading ──
  if (tokenId && loading) {
    return (
      <div className={shell}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
          Reading on-chain provenance…
        </div>
      </div>
    )
  }

  // ── Not on chain yet ──
  if (!tokenId || !data) {
    return (
      <div className={shell}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-violet-500/20 p-2">
            <ShieldQuestion className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Provenance &amp; Authenticity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This item isn&apos;t on the blockchain yet. Once the seller mints its digital twin,
              its full ownership history and authenticity certificate appear here.
            </p>
            <Badge className="mt-2 border-white/10 bg-white/5 text-[10px] text-muted-foreground">
              Not yet minted
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  const { events, attestation, owner } = data

  return (
    <div className="mt-6 rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/8 to-transparent p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-500/20 p-2">
            <Link2 className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Provenance &amp; Authenticity</p>
            <p className="text-[11px] text-muted-foreground">
              On-chain token <span className="font-mono text-violet-300">#{tokenId}</span>
            </p>
          </div>
        </div>

        {attestation.exists ? (
          <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-300">
            <BadgeCheck className="h-3 w-3" /> Authenticated
          </Badge>
        ) : (
          <Badge className="gap-1 border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-300">
            <ShieldQuestion className="h-3 w-3" /> Pending Authentication
          </Badge>
        )}
      </div>

      {/* Attestation detail */}
      {attestation.exists && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div className="text-[11px] text-muted-foreground">
            Attested by{" "}
            <span className="font-mono text-emerald-300">{truncateAddress(attestation.attestor)}</span>{" "}
            on {formatTs(attestation.timestamp)}.
            <span className="mt-0.5 block break-all font-mono text-[10px] text-muted-foreground/70">
              {attestation.certHash}
            </span>
          </div>
        </div>
      )}

      {/* Chain of custody */}
      <div className="mt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Chain of custody
        </p>
        <ol className="relative space-y-4 border-l border-white/10 pl-5">
          {events.map((ev, i) => {
            const isMint = ev.event === "Minted"
            return (
              <li key={i} className="relative">
                <span
                  className={cn(
                    "absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-midnight",
                    isMint ? "bg-violet-500" : "bg-pink-500",
                  )}
                >
                  {isMint ? (
                    <Sparkles className="h-2 w-2 text-white" />
                  ) : (
                    <ArrowRightLeft className="h-2 w-2 text-white" />
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {isMint ? "Digital twin minted" : "Ownership transferred"}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {truncateAddress(ev.owner)}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{formatTs(ev.timestamp)}</p>
              </li>
            )
          })}
        </ol>
      </div>

      {owner && (
        <p className="mt-4 border-t border-white/5 pt-3 text-[11px] text-muted-foreground">
          Current owner:{" "}
          <span className="font-mono text-violet-300">{truncateAddress(owner)}</span>
        </p>
      )}
    </div>
  )
}
