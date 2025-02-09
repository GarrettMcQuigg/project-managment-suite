import React from 'react';
import SubtleBackground from '@/packages/lib/components/subtle-background';

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <SubtleBackground />

      <div className="relative pt-24 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
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
                <p className="text-md text-muted-foreground mb-2">
                  Permission is granted to temporarily access the platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
                  title, and under this license you may not:
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="ml-8">• Modify or copy the materials</p>
                  <p className="ml-8">• Use the materials for any commercial purpose without our consent</p>
                  <p className="ml-8">• Attempt to decompile or reverse engineer any software contained in the platform</p>
                  <p className="ml-8">• Remove any copyright or other proprietary notations from the materials</p>
                  <p className="ml-8">• Transfer the materials to another person or "mirror" the materials on any other server</p>
                </div>
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

              {/* Payment Terms Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Payment Terms</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  Subscription fees are billed in advance on a monthly or annual basis. If you elect to use paid features or services, you agree to pay all fees associated with
                  such features or services. All fees are exclusive of taxes, which we will charge as applicable. We may change our fees at any time and will give notice upon doing
                  so.
                </p>
              </div>

              {/* User Content Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">User Content</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  You retain all rights to any content you submit, post or display on or through the platform. By submitting, posting or displaying content on or through the
                  platform, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute
                  such content.
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

              {/* Termination Section */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Termination</h2>
                <p className="text-md text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason
                  whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the
                  platform.
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
