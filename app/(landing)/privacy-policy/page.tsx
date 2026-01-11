import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <div className="relative pt-24 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-6 gap-8">
            <div className="col-span-12 lg:col-span-6 space-y-16">
              {/* Hero Section */}
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-xl text-muted-foreground">We take your privacy seriously. Here's how we handle your data.</p>
              </div>

              {/* Information Collection Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
                <p className="text-xl text-muted-foreground mb-2">We collect information that you provide directly to us, including:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="ml-8">• Personal information (name, email address, phone number)</p>
                  <p className="ml-8">• Professional information (portfolio, client history, project details)</p>
                  <p className="ml-8">• Project data (timelines, tasks, milestones, resources)</p>
                  <p className="ml-8">• Payment information (processed through secure third-party providers)</p>
                  <p className="ml-8">• Communications between you, your team members, and your clients</p>
                </div>
              </div>

              {/* Information Usage Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">How We Use Your Information</h2>
                <p className="text-md text-muted-foreground mb-2">We use the collected information to:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="ml-8">• Provide and maintain our platform</p>
                  <p className="ml-8">• Enable project planning, tracking, and collaboration features</p>
                  <p className="ml-8">• Process your transactions and manage your account</p>
                  <p className="ml-8">• Send you important service updates and notifications</p>
                  <p className="ml-8">• Improve and optimize our platform</p>
                  <p className="ml-8">• Comply with legal obligations</p>
                </div>
              </div>

              {/* Data Security Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Data Security</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information and business data. These measures include encrypted
                  data storage, secure servers, and regular security assessments. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee
                  absolute security.
                </p>
              </div>

              {/* Data Sharing Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Data Sharing and Third Parties</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We do not sell your personal information or business data. We may share your information with third-party service providers who assist us in operating our
                  platform, processing payments, enabling collaboration features, and analyzing our services. These providers are contractually obligated to protect your
                  information and can only use it for specified purposes.
                </p>
              </div>

              {/* User Rights Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Your Rights</h2>
                <p className="text-md text-muted-foreground mb-2">You have the right to:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="ml-8">• Access your personal information and business data</p>
                  <p className="ml-8">• Correct inaccurate information</p>
                  <p className="ml-8">• Request deletion of your information</p>
                  <p className="ml-8">• Opt out of marketing communications and non-essential data processing</p>
                </div>
              </div>

              {/* Cookie Policy Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Cookie Policy</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us remember your preferences, analyze usage
                  patterns, and enable collaborative features. You can control cookie preferences through your browser settings. Essential cookies required for basic functionality
                  cannot be disabled.
                </p>
              </div>

              {/* Policy Changes Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Changes to Privacy Policy</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page. Your continued use of our
                  services after such modifications constitutes your acknowledgment of the modified policy.
                </p>
              </div>

              {/* Contact Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  If you have any questions about this privacy policy or our practices, please contact us at support@Flow Folder.com. We will respond to your inquiry as soon as
                  possible.
                </p>
              </div>
            </div>

            {/* Right column - Space for future visualizer */}
            <div className="hidden lg:block lg:col-span-4">{/* Visualizer will go here */}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
