"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { GradientText } from "@/components/brand/gradient-text"

const testimonials = [
  {
    id: "1",
    name: "Marcus Chen",
    handle: "@marcushorology",
    role: "Watch Collector, Hong Kong",
    avatar: "MC",
    avatarColor: "from-violet-500 to-violet-700",
    rating: 5,
    quote:
      "Aureon is simply the best platform for serious watch collectors. The authentication process is rigorous and every seller I've dealt with has been professional. Picked up a Nautilus 5711 that was exactly as described.",
  },
  {
    id: "2",
    name: "Isabelle Mercier",
    handle: "@isabelleresells",
    role: "Art Dealer, Paris",
    avatar: "IM",
    avatarColor: "from-pink-500 to-pink-700",
    rating: 5,
    quote:
      "As a seller, Aureon's platform gives me the credibility I need. My clients trust that every piece is verified, and the blockchain provenance feature is going to be game-changing when it launches.",
  },
  {
    id: "3",
    name: "Jordan Ellis",
    handle: "@jordancollects",
    role: "Fashion Collector, NYC",
    avatar: "JE",
    avatarColor: "from-amber-500 to-amber-700",
    rating: 5,
    quote:
      "Finally a marketplace that takes authentication as seriously as the collectors who use it. The interface is gorgeous, buying is seamless, and my Birkin arrived in perfect condition with all the documentation.",
  },
]

export function Testimonials() {
  return (
    <section className="bg-midnight py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-xl text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-pink-400">
            ✦ Collector voices
          </p>
          <h2
            className="font-display font-bold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Trusted by the{" "}
            <GradientText animated>Best</GradientText>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              variants={{
                hidden: { opacity: 0, y: 32 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
              }}
            >
              <div className="glass-card flex h-full flex-col rounded-2xl p-6">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarColor} text-xs font-bold text-white shrink-0`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
