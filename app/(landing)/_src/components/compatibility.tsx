
import { Button } from "@/packages/lib/components/button"
import { User } from "@prisma/client"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AUTH_CHECKPOINT_ROUTE, DASHBOARD_ROUTE } from "@/packages/lib/routes"

export function CompatibilitySection({ currentUser }: { currentUser: User | null }) {
  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <div className="text-primary text-xl font-semibold">Compatible with all devices</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Desktop and mobile.
            </h2>
            <p className="text-xl text-muted-foreground">
              Run your business from anywhere with our fully responsive web
              app. Manage your team, track your operations, and keep your
              clients happy.
            </p>
            <Link href={currentUser ? DASHBOARD_ROUTE : AUTH_CHECKPOINT_ROUTE}>
              <Button variant="outline" className="group mt-4">
                <span>{currentUser ? 'Launch app' : 'Sign Up'}</span>
                <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Right Side - Device Screenshots */}
          <div className="relative">
            {/* Desktop Screenshot (Bottom Layer) */}
            <div className="relative z-10 ml-auto max-w-[80%]">
              <Image
                src="/placeholder.svg"
                alt="Desktop interface"
                width={600}
                height={400}
                className="rounded-lg shadow-xl border border-border/20"
              />
            </div>
            
            {/* Mobile Screenshot (Top Layer) */}
            <div className="absolute left-8 top-16 z-20 w-[40%] max-w-[250px]">
              <Image
                src="/placeholder.svg"
                alt="Mobile interface"
                width={175}
                height={300}
                className="rounded-lg shadow-xl border border-border/20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
