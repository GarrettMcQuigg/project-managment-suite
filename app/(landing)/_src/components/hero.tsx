import { Button } from "@/packages/lib/components/button"
import { ArrowRight, Calendar, ChevronDown, Play, Star, Users, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AUTH_SIGNUP_ROUTE } from "@/packages/lib/routes"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-start md:items-center justify-center px-4 pt-16 md:pt-8 pb-12 mb-12">
      <div className="container mx-auto max-w-7xl mb-24">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-[60%] space-y-8">
            <div className="hidden sm:inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              <span>Trusted by creative professionals worldwide</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Transform How You
                <span className="text-primary block">Think About Business</span>
              </h1>
              <p className="text-md md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Turn creative chaos into your competitive advantage. Organize projects, track deadlines, manage clients, and collaborate seamlessly—all in one beautifully designed platform.              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={AUTH_SIGNUP_ROUTE} >
                <Button className="text-lg px-6 py-6 group opacity-90">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {/* TODO: Add demo video */}
              <Link href="#" >
              <Button variant="outline" className="text-lg px-6 py-6">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
              </Link>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-md">Project Planning</div>
                  <div className="text-sm text-muted-foreground">Simplified</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-md">Client Management</div>
                  <div className="text-sm text-muted-foreground">Made Easy</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-md">Workflow Automation</div>
                  <div className="text-sm text-muted-foreground">Save Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image (remaining width) */}
          {/* TODO: Update this with something better */}
          <div className="lg:w-[40%] relative">
            <div className="relative z-10">
              <Image
                src="/images/landing/landing-page-stock-img.jpg"
                alt="Dashboard Preview"
                width={500}
                height={500}
                className="rounded-2xl shadow-2xl border border-border/50"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bouncing down arrow */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <ChevronDown className="w-6 h-6 text-primary" />
        </div>
      </div>
    </section>
  )
}