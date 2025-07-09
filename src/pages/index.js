import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function RedirectPage() {
  const [countdown, setCountdown] = useState(5);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);
    
    // Immediate redirect for better UX
    const immediateRedirect = setTimeout(() => {
      window.location.href = 'https://the-explainer.vercel.app';
    }, 5000);
    
    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          clearTimeout(immediateRedirect);
          window.location.href = 'https://the-explainer.vercel.app';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(immediateRedirect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Head>
        <title>Shakespeare Explainer - Moved</title>
        <meta name="description" content="Shakespeare Explainer has moved to a new location" />
        <meta httpEquiv="refresh" content="5;url=https://the-explainer.vercel.app" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 text-center border border-white/20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Icon */}
        <div className="mb-10">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Shakespeare Explainer
          </h1>
          <p className="text-gray-300 text-xl">
            has moved to a new home
          </p>
        </div>
        
        {/* New URL Card */}
        <div className="mb-12">
          <div className="bg-white/10 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <p className="text-white/80 font-medium mb-4 text-sm uppercase tracking-wide">
              New Location
            </p>
            <a 
              href="https://the-explainer.vercel.app"
              className="text-blue-300 hover:text-blue-200 underline break-all text-xl font-mono transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              the-explainer.vercel.app
            </a>
          </div>
        </div>
        
        {/* Countdown */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-3 text-white/70">
            <span className="text-lg">Redirecting in</span>
            <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[3rem] text-center">
              <span className="font-bold text-white text-xl">{countdown}</span>
            </div>
            <span className="text-lg">seconds</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-6">
          <a
            href="https://the-explainer.vercel.app"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-5 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center justify-center space-x-3">
              <span>Go to New App</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
          
          <button
            onClick={() => window.location.href = 'https://the-explainer.vercel.app'}
            className="block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            Redirect Now
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/50 text-base">
            Thank you for using Shakespeare Explainer! 🎭
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 