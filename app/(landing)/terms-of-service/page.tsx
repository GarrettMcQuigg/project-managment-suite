import CustomBackground from '@/packages/lib/components/custom-background';
import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-8 px-4 mt-12">
      <CustomBackground />

      <div className="max-w-4xl mx-auto backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-12">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              By accessing or using our platform, you agree to our Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing this platform. The materials contained in this platform are protected by applicable copyright and trademark law.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
            <div className="text-gray-700 dark:text-muted-foreground space-y-4">
              <p>
                Permission is granted to temporarily access the platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
                title, and under this license you may not:
              </p>
              <div className="pl-6 space-y-2">
                <p>• Modify or copy the materials</p>
                <p>• Use the materials for any commercial purpose without our consent</p>
                <p>• Attempt to decompile or reverse engineer any software contained in the platform</p>
                <p>• Remove any copyright or other proprietary notations from the materials</p>
                <p>• Transfer the materials to another person or "mirror" the materials on any other server</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">3. Account Terms</h2>
            <div className="text-gray-700 dark:text-muted-foreground space-y-4">
              <p>You must:</p>
              <div className="pl-6 space-y-2">
                <p>• Provide accurate, current, and complete information</p>
                <p>• Maintain and update your account information</p>
                <p>• Keep your password secure and confidential</p>
                <p>• Notify us immediately of any unauthorized use of your account</p>
                <p>• Be responsible for all activities that occur under your account</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">4. Payment Terms</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              Subscription fees are billed in advance on a monthly or annual basis. If you elect to use paid features or services, you agree to pay all fees associated with such
              features or services. All fees are exclusive of taxes, which we will charge as applicable. We may change our fees at any time and will give notice upon doing so.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">5. User Content</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              You retain all rights to any content you submit, post or display on or through the platform. By submitting, posting or displaying content on or through the platform,
              you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">6. Service Availability and Support</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              We strive to provide a reliable and available service. However, we do not guarantee that the service will be available at all times. We may experience hardware,
              software, or other problems or need to perform maintenance related to the platform, resulting in interruptions, delays, or errors. We reserve the right to change,
              revise, update, suspend, discontinue, or otherwise modify the platform at any time.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              In no event shall we be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the
              use or inability to use the materials on our platform, even if we or an authorized representative has been notified orally or in writing of the possibility of such
              damage.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason
              whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the
              platform.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">9. Governing Law</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              These Terms shall be governed and construed in accordance with the laws of the United States of America, without regard to its conflict of law provisions. Our failure
              to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Changes will be
              effective immediately upon posting. Your continued use of the platform after any such changes constitutes your acceptance of the new Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
