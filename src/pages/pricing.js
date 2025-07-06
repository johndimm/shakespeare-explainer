import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/';
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '20 explanations on first day',
        '3 daily explanations after',
        'Basic text explanations',
        'Community support'
      ],
      excluded: [
        'Advanced analysis',
        'Priority support',
        'Unlimited usage'
      ],
      buttonText: 'Get Started',
      buttonAction: () => window.location.href = '/',
      popular: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For serious Shakespeare enthusiasts',
      features: [
        '100 daily explanations',
        '500 daily chat messages',
        'Advanced literary analysis',
        'Priority support',
        'Unlimited usage',
        'Early access to new features'
      ],
      excluded: [],
      buttonText: 'Upgrade Now',
      buttonAction: handleUpgrade,
      popular: true
    }
  ];

  return (
    <>
      <Head>
        <title>Pricing - Shakespeare Explainer</title>
        <meta name="description" content="Choose your plan for Shakespeare Explainer" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col justify-center items-center px-2 py-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold font-sans tracking-wide bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Unlock the full power of Shakespeare analysis with our premium features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-10 bg-white/80 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 flex flex-col items-center ${plan.popular ? 'ring-2 ring-purple-400/40' : ''}`}
              style={{ minHeight: 480 }}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-1.5 rounded-full text-xs font-semibold shadow-md tracking-wide uppercase">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold font-sans text-gray-900 mb-2 mt-2 tracking-wide">{plan.name}</h3>
              <div className="mb-2 flex items-end justify-center">
                <span className="text-5xl font-extrabold text-gray-900 font-sans tracking-tight">{plan.price}</span>
                <span className="text-base text-gray-400 ml-2 mb-1">{plan.period}</span>
              </div>
              <p className="text-gray-500 mb-8 text-center min-h-[48px]">{plan.description}</p>
              <ul className="space-y-3 mb-8 w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-base text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
                {plan.excluded.map((feature, i) => (
                  <li key={i} className="flex items-center text-base text-gray-400">
                    <svg className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={plan.buttonAction}
                className={`w-full py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="w-full max-w-5xl mb-10">
          <h2 className="text-3xl font-bold font-sans text-center text-gray-900 mb-10 tracking-wide">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/90 rounded-2xl shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-500">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens to my data?</h3>
              <p className="text-gray-500">Your data is securely stored and you can export it anytime. We never share your personal information with third parties.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-500">We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my payment secure?</h3>
              <p className="text-gray-500">Yes, we use Stripe for secure payment processing. Your payment information is encrypted and never stored on our servers.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-8">
          <p className="text-gray-500 mb-4">Still have questions? We're here to help!</p>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300 shadow"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
} 