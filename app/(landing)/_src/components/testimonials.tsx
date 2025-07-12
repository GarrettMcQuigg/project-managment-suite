
import { Badge } from "@/packages/lib/components/badge"
import { Card, CardContent } from "@/packages/lib/components/card"
import { Quote, Star } from "lucide-react"
import Image from "next/image"

// TODO: Replace with actual testimonials
const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO",
    company: "TechFlow Inc.",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "This platform transformed our entire workflow. We've seen a 300% increase in productivity and our team collaboration has never been better. The ROI was evident within the first month.",
    metrics: "300% productivity increase",
  },
  {
    name: "Marcus Rodriguez",
    role: "Operations Director",
    company: "Global Dynamics",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "The analytics and reporting features are game-changing. We can now make data-driven decisions in real-time, which has significantly improved our operational efficiency.",
    metrics: "50% faster decision making",
  },
  {
    name: "Lisa Thompson",
    role: "Marketing Manager",
    company: "BrandBoost",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "The collaboration tools have revolutionized how our remote team works together. Projects that used to take weeks now get completed in days.",
    metrics: "60% faster project completion",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 relative">
      {/* Gradient background that fades to transparent at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent">
      </div>
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-primary border-primary/20">
            Customer Success Stories
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Trusted by Industry
            <span className="text-primary block">Professionals</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join other successful professionals that have transformed their operations and achieved remarkable
            growth with our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 group"
            >
              <CardContent className="p-6 space-y-4">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />

                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed">"{testimonial.content}"</p>

                {/* Metrics Badge */}
                <Badge variant="secondary" className="text-xs">
                  {testimonial.metrics}
                </Badge>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
