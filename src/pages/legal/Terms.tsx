import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
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
          <h1 className="text-lg font-semibold">Terms of Service</h1>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto prose prose-sm">
        <p className="text-gray-500">Last updated: December 2024</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the GOGO application ("App"), you agree to be bound by these
          Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          GOGO provides a platform that connects users with transportation services, food delivery,
          and grocery shopping services in the Philippines. We act as an intermediary between users
          and service providers.
        </p>

        <h2>3. User Registration</h2>
        <p>
          To use certain features of the App, you must register and create an account. You agree to:
        </p>
        <ul>
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized use</li>
        </ul>

        <h2>4. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the App for any unlawful purpose</li>
          <li>Interfere with the proper working of the App</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Harass or abuse service providers or other users</li>
        </ul>

        <h2>5. Payments and Fees</h2>
        <p>
          You agree to pay all applicable fees for services rendered through the App. Prices are
          subject to change. Payment methods include cash, e-wallets (GCash, Maya), and credit/debit cards.
        </p>

        <h2>6. Cancellations and Refunds</h2>
        <p>
          Cancellation policies vary by service type. Refunds, when applicable, will be processed
          according to our refund policy. Some cancellations may incur fees.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          GOGO is not liable for any indirect, incidental, or consequential damages arising from
          your use of the App or services obtained through the App.
        </p>

        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use of the App after
          changes constitutes acceptance of the modified Terms.
        </p>

        <h2>9. Contact Information</h2>
        <p>
          For questions about these Terms, please contact us at:
          <br />
          Email: support@gogo.ph
          <br />
          Phone: +63 XXX XXX XXXX
        </p>
      </div>
    </div>
  )
}
