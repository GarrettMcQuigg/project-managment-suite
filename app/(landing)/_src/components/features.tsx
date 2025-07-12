
import { Badge } from "@/packages/lib/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card"
import { FEATURES_ROUTE } from "@/packages/lib/routes"
import { BarChart3, Shield, Zap, Users, Smartphone, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Get deep insights into your business performance with real-time analytics.",
    benefits: ["Real-time data tracking", "Predictive analytics", "Export capabilities"],
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Top-level security with end-to-end encryption and advanced threat protection.",
    benefits: [
      "Encrypted data storage",
      "Multi-factor authentication",
      "Secure access controls",
    ],
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Experience blazing-fast performance with our optimized interface designed for creative workflows.",
    benefits: ["Quick project access", "Responsive interface", "Fast file previews", "Efficient search capabilities"],
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Seamlessly collaborate with your team using built-in tools and workflow management.",
    benefits: [
      "Real-time collaboration",
      "Role-based permissions",
      "Activity tracking",
      "Integration with popular tools",
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile Optimization",
    description: "Access your business from anywhere, anytime, on any device with our fully responsive design.",
    benefits: ["Fully responsive design", "Web and Mobile capabilities", "Push notifications", "Touch-optimized interface"],
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-primary border-primary/20">
            Features & Benefits
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Everything You Need to
            <span className="text-primary block">Scale Your Business</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features you need to grow, manage, and optimize your
            business operations efficiently.
          </p>
        </div>

        {/* Features Grid - Optimized for 5 cards */}
        <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto">
          {/* First row - 3 cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.slice(0, 3).map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
              >
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Second row - 2 cards centered */}
          <div className="grid md:grid-cols-2 gap-8 md:max-w-3xl mx-auto">
            {features.slice(3, 5).map((feature, index) => (
              <Card
                key={index + 3}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
              >
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link href={FEATURES_ROUTE} className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all cursor-pointer group">
            <span className="text-lg font-medium">Explore all features</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
