import React from 'react';
import SubtleBackground from '@/packages/lib/components/subtle-background';

export default function AboutUs() {
  return (
    <div className="min-h-screen">
      <SubtleBackground />

      <div className="relative pt-24 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-10 gap-8">
            <div className="col-span-12 lg:col-span-6 space-y-24">
              {/* Hero Section */}
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight">We're transforming how creative professionals manage their business, one workflow at a time.</h1>
              </div>

              {/* Mission Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  CreativeSuite CRM was born from a simple truth: creative professionals need a different kind of business tool. We're here to transform how creatives manage their
                  client relationships. Our mission is to empower creatives with tools that understand their workflow, speak their language, and give them more time to do what they
                  do best — create.
                </p>
              </div>

              {/* Built for Creatives Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Built for Creatives, by Creatives</h2>
                <div className="text-lg text-muted-foreground space-y-4">
                  <p className="mb-4">What makes us different:</p>
                  <div className="space-y-2">
                    <p>• Visual-first approach that aligns with creative workflows</p>
                    <p>• Project management tools designed for creative milestones</p>
                    <p>• Client feedback and revision tracking built-in</p>
                    <p>• Intuitive interface that doesn't get in your way</p>
                  </div>
                </div>
              </div>

              {/* Values Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Our Values</h2>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Creativity First</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We believe that business tools should enhance creativity, not hinder it. Every feature we build starts with this principle.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Simplicity Matters</h3>
                    <p className="text-muted-foreground leading-relaxed">Complex doesn't mean better. We focus on intuitive design that lets you focus on your craft.</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Community Driven</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our roadmap is shaped by real feedback from creative professionals. Your voice matters in building the future of CreativeSuite.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Space for future visualizer */}
            <div className="hidden lg:block lg:col-span-6">{/* Visualizer will go here */}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
