export default function AboutUs() {
  return (
    <div className="min-h-screen">
      <div className="relative pt-24 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-center">
                We're transforming how <span className="text-primary">creative professionals</span> manage their business, one workflow at a time.
              </h1>
            </div>

            {/* Mission Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Solira was born from a simple truth: Creative professionals need a different kind of tool to manage their business. We're here to transform how creatives manage
                their entire business, from client relationships to project management and much more. Our mission is to empower our users with tools that understand their workflow,
                speak their language, and give them more time to do what they do best — create.
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
                  <p>• Invoice management tools you won't find anywhere else</p>
                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Our Values</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-medium">Creativity First</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe that business tools should enhance creativity, not hinder it. Every feature we build starts with this principle.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium">Simplicity Matters</h3>
                  <p className="text-muted-foreground leading-relaxed">Complex doesn't always mean better. We focus on intuitive design that lets you focus on your craft.</p>
                </div>
                <div>
                  <h3 className="text-xl font-medium">Community Driven</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our roadmap is shaped by real feedback from creative professionals. Your voice matters in building the future of Solira.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
