import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto prose prose-sm">
        <p className="text-gray-500">Last updated: December 2024</p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, including:
        </p>
        <ul>
          <li>Name, email address, and phone number</li>
          <li>Payment information</li>
          <li>Location data when you use our services</li>
          <li>Communication preferences</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send promotional communications (with your consent)</li>
          <li>Monitor and analyze usage patterns</li>
          <li>Detect and prevent fraud</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          We may share your information with:
        </p>
        <ul>
          <li>Service providers (drivers, merchants) to fulfill your requests</li>
          <li>Payment processors to handle transactions</li>
          <li>Law enforcement when required by law</li>
        </ul>
        <p>
          We do not sell your personal information to third parties.
        </p>

        <h2>4. Location Data</h2>
        <p>
          We collect precise location data when you use our ride-hailing and delivery services.
          This is necessary to connect you with nearby drivers and merchants. You can disable
          location services in your device settings, but this may limit app functionality.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information.
          However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to
          provide services. You may request deletion of your account and associated data.
        </p>

        <h2>7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2>8. Children's Privacy</h2>
        <p>
          Our services are not intended for users under 18 years of age. We do not knowingly
          collect information from children.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any
          changes by posting the new policy on this page.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          For questions about this Privacy Policy, please contact us at:
          <br />
          Email: privacy@gogo.ph
          <br />
          Phone: +63 XXX XXX XXXX
        </p>
      </div>
    </div>
  )
}
