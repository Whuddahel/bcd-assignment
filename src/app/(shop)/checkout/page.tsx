"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, ArrowRight, CheckCircle, Shield, Lock, MapPin, CreditCard,
  Package, ChevronRight, AlertCircle,
} from "lucide-react"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GradientText } from "@/components/brand/gradient-text"
import { useCartStore } from "@/stores/cart-store"
import { formatPrice, cn } from "@/lib/utils"
import { toast } from "sonner"
import { getStripeBrowserClient } from "@/lib/stripe/client"
import { useUser } from "@/hooks/use-user"

// Direct process.env access so Next.js can statically inline this at build time —
// values pulled through the shared env/config helpers are not reliably available
// inside client bundles.
const STRIPE_ENABLED = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
const stripePromise = STRIPE_ENABLED ? getStripeBrowserClient() : null

type Step = "address" | "payment" | "review"
type Address = {
  name: string; email: string; phone: string
  line1: string; city: string; state: string; postal: string; country: string
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "address", label: "Shipping",   icon: MapPin      },
  { id: "payment", label: "Payment",    icon: CreditCard  },
  { id: "review",  label: "Review",     icon: Package     },
]

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = steps.findIndex((s) => s.id === current)
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => {
        const Icon  = step.icon
        const done  = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all",
              done   && "gradient-brand text-white",
              active && "border-2 border-violet-500 text-violet-400 bg-violet-500/10",
              !done && !active && "border border-white/10 text-muted-foreground bg-white/3",
            )}>
              {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span className={cn(
              "ml-2 text-xs font-medium hidden sm:block",
              active ? "text-foreground" : done ? "text-violet-400" : "text-muted-foreground",
            )}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="mx-3 h-4 w-4 text-muted-foreground/40" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function OrderSummary() {
  const { items, totalPrice } = useCartStore()
  const subtotal = totalPrice()
  const fee = Math.round(subtotal * 0.1)
  const shipping = 0

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="mb-4 font-semibold text-foreground">Order Summary</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3">
            <div className={cn("relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br", item.product.gradient)}>
              {item.product.images[0] && (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{item.product.title}</p>
              <p className="text-[10px] text-muted-foreground">Qty {item.qty}</p>
            </div>
            <p className="shrink-0 text-xs font-bold text-foreground">
              {formatPrice(item.product.price * item.qty)}
            </p>
          </div>
        ))}
      </div>
      <Separator className="my-4 bg-white/5" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Platform fee (10%)</span>
          <span className="text-foreground">{formatPrice(fee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-emerald-400">Insured · Free</span>
        </div>
        <Separator className="bg-white/5" />
        <div className="flex justify-between text-base font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatPrice(subtotal + fee + shipping)}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-violet-400" />
        All payments are encrypted and secure
      </div>
    </div>
  )
}

function AddressStep({
  address, setAddress, loading, error, onContinue,
}: {
  address: Address
  setAddress: React.Dispatch<React.SetStateAction<Address>>
  loading: boolean
  error: string | null
  onContinue: () => void
}) {
  function field(id: keyof Address, label: string, colSpan = 1) {
    return (
      <div className={cn("space-y-1.5", colSpan === 2 && "sm:col-span-2")}>
        <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
        <Input
          id={id}
          value={address[id]}
          onChange={(e) => setAddress((a) => ({ ...a, [id]: e.target.value }))}
          className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
        />
      </div>
    )
  }

  return (
    <motion.div
      key="address"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-5 flex items-center gap-2 font-semibold text-foreground">
          <MapPin className="h-4 w-4 text-violet-400" />
          Shipping address
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("name",   "Full name",  2)}
          {field("email",  "Email",      2)}
          {field("phone",  "Phone",      2)}
          {field("line1",  "Address",    2)}
          {field("city",   "City")}
          {field("postal", "Postal code")}
          {field("country","Country")}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <div />
        <Button
          className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
          onClick={onContinue}
          disabled={loading}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Preparing payment…
            </>
          ) : (
            <>Continue to payment <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

// ── Real Stripe payment flow (mounted once a PaymentIntent client_secret exists) ──
//
// Payment + review share one component so the PaymentElement never unmounts
// between them — stripe.confirmPayment() requires a currently-mounted Payment
// Element, and swapping to a separate review component would tear it down.

function RealPaymentAndReview({
  step, setStep, address, total,
}: {
  step: Extract<Step, "payment" | "review">
  setStep: (s: Step) => void
  address: Address
  total: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function placeOrder() {
    if (!stripe || !elements) return
    setProcessing(true)
    setError(null)

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please check your details and try again.")
      setProcessing(false)
      return
    }

    clearCart()
    router.push(`/checkout/success?payment_intent=${paymentIntent.id}`)
  }

  return (
    <motion.div
      key="real-payment"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className={cn("glass-card rounded-2xl p-6", step === "review" && "hidden")}>
        <h2 className="mb-5 flex items-center gap-2 font-semibold text-foreground">
          <CreditCard className="h-4 w-4 text-violet-400" />
          Payment details
        </h2>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {step === "review" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-violet-400" /> Shipping to
              </h3>
              <button onClick={() => setStep("address")} className="text-xs text-violet-400 hover:text-violet-300">
                Edit
              </button>
            </div>
            <p className="text-sm text-foreground">{address.name}</p>
            <p className="text-xs text-muted-foreground">{address.line1}, {address.city} {address.postal}</p>
            <p className="text-xs text-muted-foreground">{address.email}</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CreditCard className="h-4 w-4 text-violet-400" /> Payment
            </h3>
            <p className="text-xs text-muted-foreground">
              Payment method securely captured by Stripe — no card details touch our servers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield,  label: "Authenticated",   sub: "Every item verified"   },
              { icon: Lock,    label: "SSL encrypted",    sub: "256-bit security"      },
              { icon: Package, label: "Insured shipping", sub: "Full coverage"         },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="glass-card rounded-xl p-3 text-center">
                <Icon className="mx-auto h-4 w-4 text-violet-400" />
                <p className="mt-1.5 text-xs font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          className="border-white/10 hover:bg-white/5"
          onClick={() => setStep(step === "review" ? "payment" : "address")}
          disabled={processing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step === "payment" ? (
          <Button
            className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
            onClick={() => setStep("review")}
          >
            Review order <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
            size="lg"
            onClick={placeOrder}
            disabled={processing || !stripe || !elements}
          >
            {processing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                />
                Processing…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Place order · {formatPrice(total)}
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ── Mock payment flow (used when no Stripe publishable key is configured) ──

function MockPaymentAndReview({
  step, setStep, address, total, onDone,
}: {
  step: Extract<Step, "payment" | "review">
  setStep: (s: Step) => void
  address: Address
  total: number
  onDone: () => Promise<void>
}) {
  const [card, setCard] = useState({
    number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123", name: "Emma Wilson",
  })
  const [processing, setProcessing] = useState(false)

  function cardField(id: keyof typeof card, label: string, placeholder: string) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
        <Input
          id={id}
          value={card[id]}
          placeholder={placeholder}
          onChange={(e) => setCard((c) => ({ ...c, [id]: e.target.value }))}
          className="border-white/10 bg-white/5 font-mono focus-visible:ring-violet-500/50"
        />
      </div>
    )
  }

  async function placeOrder() {
    setProcessing(true)
    await onDone()
  }

  if (step === "payment") {
    return (
      <motion.div
        key="payment"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold text-foreground">
            <CreditCard className="h-4 w-4 text-violet-400" />
            Payment details
          </h2>

          <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Development mode — mock payment
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Real Stripe Payment Element loads when{" "}
                  <code className="rounded bg-white/10 px-1 text-[10px]">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
                  is set. For now, any card details proceed.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Card number</Label>
              <div className="relative">
                <Input
                  value={card.number}
                  onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                  className="border-white/10 bg-white/5 font-mono focus-visible:ring-violet-500/50 pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <div className="h-4 w-6 rounded bg-white/20" />
                  <div className="h-4 w-6 rounded bg-white/10" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {cardField("expiry", "Expiry", "MM/YY")}
              {cardField("cvc",    "CVC",    "123")}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Card type</Label>
                <div className="flex h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3">
                  <div className="h-4 w-6 rounded bg-blue-500/50" />
                  <span className="text-xs text-muted-foreground">Visa</span>
                </div>
              </div>
            </div>
            {cardField("name", "Name on card", "Emma Wilson")}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setStep("address")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
            onClick={() => setStep("review")}
          >
            Review order <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-violet-400" /> Shipping to
            </h3>
            <button onClick={() => setStep("address")} className="text-xs text-violet-400 hover:text-violet-300">
              Edit
            </button>
          </div>
          <p className="text-sm text-foreground">{address.name}</p>
          <p className="text-xs text-muted-foreground">{address.line1}, {address.city} {address.postal}</p>
          <p className="text-xs text-muted-foreground">{address.email}</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CreditCard className="h-4 w-4 text-violet-400" /> Payment
            </h3>
            <button onClick={() => setStep("payment")} className="text-xs text-violet-400 hover:text-violet-300">
              Edit
            </button>
          </div>
          <p className="text-sm text-foreground">•••• •••• •••• {card.number.slice(-4)}</p>
          <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Shield,  label: "Authenticated",   sub: "Every item verified"   },
            { icon: Lock,    label: "SSL encrypted",    sub: "256-bit security"      },
            { icon: Package, label: "Insured shipping", sub: "Full coverage"         },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="glass-card rounded-xl p-3 text-center">
              <Icon className="mx-auto h-4 w-4 text-violet-400" />
              <p className="mt-1.5 text-xs font-medium text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setStep("payment")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
          size="lg"
          onClick={placeOrder}
          disabled={processing}
        >
          {processing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Processing…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Place order · {formatPrice(total)}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { items, clearCart, totalPrice } = useCartStore()
  const [step, setStep] = useState<Step>("address")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)
  const [mockProcessing, setMockProcessing] = useState(false)

  const [address, setAddress] = useState<Address>({
    name: "", email: "", phone: "",
    line1: "", city: "", state: "", postal: "", country: "",
  })

  // Prefill from the signed-in user once their session loads — still editable.
  useEffect(() => {
    if (!user) return
    setAddress((a) => ({
      ...a,
      name: a.name || user.fullName || "",
      email: a.email || user.email || "",
      phone: a.phone || user.phone || "",
    }))
  }, [user])

  const subtotal = totalPrice()
  const fee = Math.round(subtotal * 0.1)
  const total = subtotal + fee

  async function goToPayment() {
    if (!STRIPE_ENABLED) {
      setStep("payment")
      return
    }
    if (clientSecret) {
      setStep("payment")
      return
    }

    setLoadingIntent(true)
    setIntentError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
          address,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.")
      setClientSecret(data.clientSecret)
      setStep("payment")
    } catch (e) {
      setIntentError(e instanceof Error ? e.message : "Could not start checkout.")
      toast.error("Checkout failed to start", { description: "Please try again." })
    } finally {
      setLoadingIntent(false)
    }
  }

  async function placeMockOrder() {
    setMockProcessing(true)
    await new Promise((r) => setTimeout(r, 2200))
    clearCart()
    router.push("/checkout/success")
  }

  if (items.length === 0 && !mockProcessing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight px-4 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items before checking out.</p>
        <Button className="gradient-brand mt-6 border-0 text-white" asChild>
          <Link href="/browse">Browse collectibles</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-midnight py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back + title */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/browse" className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Checkout</p>
            <h1 className="font-display text-2xl font-bold">
              Complete Your <GradientText>Order</GradientText>
            </h1>
          </div>
        </div>

        <StepIndicator current={step} />

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left panel */}
          <div>
            <AnimatePresence mode="wait">
              {step === "address" && (
                <AddressStep
                  address={address}
                  setAddress={setAddress}
                  loading={loadingIntent}
                  error={intentError}
                  onContinue={goToPayment}
                />
              )}

              {step !== "address" && STRIPE_ENABLED && clientSecret && (
                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#7C3AED",
                        colorBackground: "transparent",
                        colorText: "#f4f4f5",
                        colorDanger: "#f87171",
                        borderRadius: "12px",
                      },
                    },
                  }}
                >
                  <RealPaymentAndReview
                    step={step as Extract<Step, "payment" | "review">}
                    setStep={setStep}
                    address={address}
                    total={total}
                  />
                </Elements>
              )}

              {step !== "address" && !STRIPE_ENABLED && (
                <MockPaymentAndReview
                  step={step}
                  setStep={setStep}
                  address={address}
                  total={total}
                  onDone={placeMockOrder}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
