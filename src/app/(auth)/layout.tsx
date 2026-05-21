import Link from "next/link"
import { AureonLogo } from "@/components/brand/aureon-logo"
import { GradientBlob } from "@/components/brand/gradient-blob"
import { NoiseOverlay } from "@/components/brand/noise-overlay"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-midnight px-4 py-12">
      <NoiseOverlay />
      <GradientBlob color="violet" size="lg" className="-left-64 -top-32" delay={0} />
      <GradientBlob color="pink"   size="md" className="-right-32 -bottom-16" delay={4} />

      <div className="relative z-10 mb-10">
        <Link href="/">
          <AureonLogo size="lg" />
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
