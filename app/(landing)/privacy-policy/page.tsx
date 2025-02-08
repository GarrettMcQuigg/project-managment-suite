import React from 'react';
import CustomBackground from '@/packages/lib/components/custom-background';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-8 px-4 mt-12">
      <CustomBackground />
      <div className="max-w-4xl mx-auto backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-12">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 dark:text-muted-foreground mb-4">We collect information that you provide directly to us, including:</p>
            <div className="pl-6 text-gray-700 dark:text-muted-foreground space-y-2">
              <p>• Personal information (name, email address, phone number)</p>
              <p>• Professional information (portfolio, client history, project details)</p>
              <p>• Payment information (processed through secure third-party providers)</p>
              <p>• Communications between you and your clients</p>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-muted-foreground mb-4">We use the collected information to:</p>
            <div className="pl-6 text-gray-700 dark:text-muted-foreground space-y-2">
              <p>• Provide and maintain our CRM services</p>
              <p>• Process your transactions and manage your account</p>
              <p>• Send you important service updates and notifications</p>
              <p>• Improve and optimize our platform</p>
              <p>• Comply with legal obligations</p>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Data Security</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect your personal information. These measures include encryption, secure servers, and
              regular security assessments. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Sharing and Third Parties</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              We do not sell your personal information. We may share your information with third-party service providers who assist us in operating our platform, processing
              payments, and analyzing our services. These providers are contractually obligated to protect your information and can only use it for specified purposes.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 dark:text-muted-foreground mb-4">You have the right to:</p>
            <div className="pl-6 text-gray-700 dark:text-muted-foreground space-y-2">
              <p>• Access your personal information</p>
              <p>• Correct inaccurate information</p>
              <p>• Request deletion of your information</p>
              <p>• Object to processing of your information</p>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Cookie Policy</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings.
              Essential cookies required for basic functionality cannot be disabled.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Changes to Privacy Policy</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page. Your continued use of our
              services after such modifications constitutes your acknowledgment of the modified policy.
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              If you have any questions about this privacy policy or our practices, please contact us at support@creativesuite.com. We will respond to your inquiry as soon as
              possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
