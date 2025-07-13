import React from 'react';
import { Users, BarChart3, Briefcase, MessageSquare, FileStack, Shield } from 'lucide-react';
import { LandingBackground } from '@/packages/lib/components/custom-background';

export default function Features() {
  return (
    <div className="min-h-screen">
      <LandingBackground />
      <div className="relative pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold">Features</h1>
            <p className="text-xl text-muted-foreground mt-4">Discover how Solira enhances your creative workflow with intuitive and thoughtfully designed features.</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Project Management */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="h-6 w-6 flex-shrink-0 text-primary" />
                Project Management
              </h2>
              <p className="text-md text-muted-foreground mb-2">Streamline your projects with:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="ml-2">• Comprehensive project details and client association</p>
                <p className="ml-2">• Integrated invoice management for each project</p>
                <p className="ml-2">• Client-shareable project timelines</p>
                <p className="ml-2">• Visual milestone tracking and progress updates</p>
              </div>
            </div>

            {/* Client Communication */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6 flex-shrink-0 text-primary" />
                Client Communication
              </h2>
              <p className="text-md text-muted-foreground mb-2">Keep clients in the loop with:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="ml-2">• Built-in client feedback system</p>
                <p className="ml-2">• Revision tracking and version control</p>
                <p className="ml-2">• Client portal for project updates</p>
                <p className="ml-2">• Automated progress notifications</p>
              </div>
            </div>

            {/* File Management */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <FileStack className="h-6 w-6 flex-shrink-0 text-primary" />
                File Management
              </h2>
              <p className="text-md text-muted-foreground mb-2">Organize your project assets with:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="ml-2">• Cloud storage integration</p>
                <p className="ml-2">• File sharing and collaboration tools</p>
              </div>
            </div>

            {/* Analytics and Reporting */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-6 w-6 flex-shrink-0 text-primary" />
                Analytics and Reporting
              </h2>
              <p className="text-md text-muted-foreground mb-2">Make data-driven decisions with:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="ml-2">• Project performance metrics</p>
                <p className="ml-2">• Time tracking and billing insights</p>
                <p className="ml-2">• Client engagement analytics</p>
                <p className="ml-2">• Custom report generation</p>
              </div>
            </div>

            {/* Team Collaboration */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 flex-shrink-0 text-primary" />
                Team Collaboration
              </h2>
              <p className="text-md text-muted-foreground mb-2">Work better together with:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="ml-2">• Real-time team communication</p>
                <p className="ml-2">• Role-based access control</p>
                <p className="ml-2">• Collaborative workspaces</p>
                <p className="ml-2">• Team capacity planning</p>
              </div>
            </div>

            {/* Customization */}
            {/* <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Palette className="h-6 w-6 flex-shrink-0" />
                Customization
              </h2>
              <p className="text-md text-muted-foreground mb-2">Make it yours with:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="ml-2">• Custom branding options</p>
                <p className="ml-2">• Workflow automation rules</p>
                <p className="ml-2">• Custom fields and forms</p>
                <p className="ml-2">• API access for integrations</p>
              </div>
            </div> */}

            {/* Security */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 flex-shrink-0 text-primary" />
                Security and Support
              </h2>
              <p className="text-md text-muted-foreground mb-2">Rest easy with:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="ml-2">• Encrypted data storage</p>
                <p className="ml-2">• Dedicated support ticket system</p>
                <p className="ml-2">• Regular backups and data recovery</p>
                <p className="ml-2">• Transparent privacy practices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
