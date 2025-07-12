import React from 'react';
import { LandingBackground } from '@/packages/lib/components/custom-background';

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <LandingBackground />

      <div className="relative pt-24 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-6 gap-8">
            <div className="col-span-12 lg:col-span-6 space-y-16">
              {/* Hero Section */}
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight">Terms of Service</h1>
                <p className="text-xl text-muted-foreground">Please read these terms carefully before using our platform.</p>
              </div>

              {/* Acceptance Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Acceptance of Terms</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  By accessing or using our platform, you agree to our Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you
                  are prohibited from using or accessing this platform. The materials contained in this platform are protected by applicable copyright and trademark law.
                </p>
              </div>

              {/* Use License Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Use License</h2>
                <p className="text-md text-muted-foreground">
                  By subscribing to our service, you are granted a license to use our platform for your business and professional purposes in accordance with your subscription plan. This is the grant of a license, not a transfer of title to our software or content, and under this license you may not:
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="ml-8">• Modify, adapt, or reverse engineer any part of our software</p>
                  <p className="ml-8">• Copy, reproduce, or distribute our platform's code or design elements</p>
                  <p className="ml-8">• Use the platform in any way that violates applicable laws or regulations</p>
                  <p className="ml-8">• Remove any copyright or other proprietary notices from the platform</p>
                  <p className="ml-8">• Sell, resell, license, or sublicense access to the platform to any third party</p>
                </div>
                <p className="text-md text-muted-foreground mt-2">
                  You retain all rights to the content and data you input into the platform. 
                </p>
              </div>

              {/* Account Terms Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Account Terms</h2>
                <p className="text-md text-muted-foreground mb-2">You must:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="ml-8">• Provide accurate, current, and complete information</p>
                  <p className="ml-8">• Maintain and update your account information</p>
                  <p className="ml-8">• Keep your password secure and confidential</p>
                  <p className="ml-8">• Notify us immediately of any unauthorized use of your account</p>
                  <p className="ml-8">• Be responsible for all activities that occur under your account</p>
                </div>
              </div>

              {/* Account Security Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Account Security</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. We recommend using strong, unique passwords and enabling any additional security features we may offer.
                </p>
                <p className="text-md text-muted-foreground leading-relaxed">
                  In the event of a security breach that affects your account, we will make reasonable efforts to notify you and provide guidance on next steps. However, we do not guarantee that our platform is immune to all security threats.
                </p>
              </div>

              {/* Payment Terms Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Payment Terms</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  Subscription fees are billed on a monthly or annual basis. If you elect to use paid features or services, you agree to pay all fees associated with
                  such features or services. All fees are exclusive of taxes, which we will charge as applicable. We may change our fees at any time and will give notice upon doing
                  so.
                </p>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We do not offer refunds for any subscription payments. If you miss a payment or your payment method fails, your account will automatically be downgraded to the free tier with limited access and features until all outstanding payments are settled. It is your responsibility to maintain valid payment information in your account settings.
                </p>
              </div>

              {/* User Content Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">User Content</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  You retain all rights to any content you submit, post, or display on or through the platform. We will not use, copy, reproduce, modify, publish, transmit, or distribute your content except as necessary to provide the service to you or as required by law.
                </p>
                <p className="text-md text-muted-foreground leading-relaxed">
                  In limited circumstances, such as legal compliance, audits, or investigations related to violations of our terms, we may need to access your content. Any such access will be limited to what is necessary for these specific purposes.
                </p>
              </div>

              {/* Intellectual Property Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Intellectual Property</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  The platform, including its name, logo, design, text, graphics, and other content provided by Solira (excluding your content), is owned by us and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-md text-muted-foreground leading-relaxed">
                  By providing feedback, suggestions, or ideas about our platform, you grant us a non-exclusive, royalty-free, worldwide, perpetual, and irrevocable right to use, copy, modify, create derivative works based upon, and otherwise exploit such feedback for any purpose without compensation to you.
                </p>
              </div>

              {/* Prohibited Uses Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Prohibited Uses</h2>
                <p className="text-md text-muted-foreground mb-2">You agree <u>NOT</u> to use the platform to:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="ml-8">• Engage in any illegal activities or violate any applicable laws</p>
                  <p className="ml-8">• Harass, abuse, or harm another person or entity</p>
                  <p className="ml-8">• Upload or transmit viruses or any other malicious code</p>
                  <p className="ml-8">• Interfere with or disrupt the platform or servers</p>
                  <p className="ml-8">• Collect or track personal information of other users</p>
                  <p className="ml-8">• Spam, phish, or engage in any other deceptive practices</p>
                  <p className="ml-8">• Use the platform in any manner that could disable, overburden, or impair its functionality</p>
                </div>
                <p className="text-md text-muted-foreground mt-2">
                  Violation of these prohibitions may result in termination of your account and potential legal action.
                </p>
              </div>

              {/* Service Availability Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Service Availability and Support</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We strive to provide a reliable and available service. However, we do not guarantee that the service will be available at all times. We may experience hardware,
                  software, or other problems or need to perform maintenance related to the platform, resulting in interruptions, delays, or errors. We reserve the right to change,
                  revise, update, suspend, discontinue, or otherwise modify the platform at any time.
                </p>
              </div>

              {/* Liability Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Limitation of Liability</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  In no event shall we be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of
                  the use or inability to use the materials on our platform, even if we or an authorized representative has been notified orally or in writing of the possibility of
                  such damage.
                </p>
              </div>

              {/* Indemnification Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Indemnification</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  You agree to defend, indemnify, and hold harmless Solira, its officers, directors, employees, and agents, from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable attorney fees and costs, arising out of or in any way connected with your access to or use of the platform, your violation of these Terms, or your violation of any third-party rights.
                </p>
              </div>

              {/* Termination Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Termination</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason
                  whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may do so by canceling your subscription and deleting your account from the settings page.
                </p>
              </div>

              {/* Governing Law Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Governing Law</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  These Terms shall be governed and construed in accordance with the laws of the United States of America, without regard to its conflict of law provisions. Our
                  failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </div>

              {/* Changes Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Changes to Terms</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Changes will be
                  effective immediately upon posting. Your continued use of the platform after any such changes constitutes your acceptance of the new Terms of Service.
                </p>
              </div>

              {/* Third-Party Services Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Third-Party Services</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  Our platform integrates with third-party services including Stripe for payment processing, Twilio for communications, and ProtonMail for secure email. When using these services through our platform, you may be subject to the terms and privacy policies of these third parties in addition to our Terms.
                </p>
                <p className="text-md text-muted-foreground leading-relaxed">
                  Specifically, if you choose to use our invoice feature, you may need to create a Stripe account and agree to Stripe's terms of service. We are not responsible for the content, privacy policies, or practices of any third-party services. Your use of such services is at your own risk.
                </p>
              </div>

              {/* Force Majeure Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Force Majeure</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We will not be liable for any delay or failure to perform any obligation under these Terms where the delay or failure results from any cause beyond our reasonable control, including acts of God, labor disputes or other industrial disturbances, electrical, telecommunications, hardware, software or other utility failures, earthquake, storms or other elements of nature, blockages, embargoes, riots, acts or orders of government, acts of terrorism, or war.
                </p>
              </div>

              {/* Severability Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Severability</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect and enforceable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
