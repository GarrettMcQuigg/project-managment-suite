"use client"

import type React from "react"
import { useState } from "react"
import { ArrowRight, Mail, CheckCircle } from "lucide-react"
import { Input } from "@/packages/lib/components/input"
import { Button } from "@/packages/lib/components/button"
import { Badge } from "@/packages/lib/components/badge"
import { Card, CardContent, CardHeader } from "@/packages/lib/components/card"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Store email in localStorage for the main component to clean up
      localStorage.setItem("email", email)
      setIsSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-border/50 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="text-center space-y-6 pb-8">
            <Badge variant="outline" className="text-primary border-primary/20 mx-auto">
              Stay Informed
            </Badge>

            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                Join Our
                <span className="text-primary ml-2">Newsletter</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Be the first to know about exclusive offers, product updates, and industry insights delivered straight to your inbox.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Email Form */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-4 h-12 text-lg border-border/50 focus:border-primary/50"
                    required
                  />
                </div>
                <Button type="submit" className="h-12 px-8 group">
                  Subscribe
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Thank you for signing up!</h3>
                  <p className="text-muted-foreground">Check your email to confirm your subscription.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
