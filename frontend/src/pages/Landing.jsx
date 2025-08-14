import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { guestLogin } = useAuth();

  const handleGuestLogin = async () => {
    await guestLogin();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="text-red-600 text-3xl font-bold">MOVIEFLIX</div>
          <div className="space-x-4">
            <Link to="/signin" className="btn-secondary">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Unlimited movies, TV shows, and more
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Watch anywhere. Cancel anytime.
          </p>
          <p className="text-lg mb-8 text-gray-400">
            Ready to watch? Enter your email to create or restart your membership.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto mb-8">
            <input 
              type="email" 
              placeholder="Email address"
              className="input-field flex-1"
            />
            <Link to="/signup" className="btn-primary px-8 py-3 text-lg whitespace-nowrap">
              Get Started →
            </Link>
          </div>

          <div className="mb-8">
            <button 
              onClick={handleGuestLogin}
              className="text-gray-400 hover:text-white underline text-sm"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-4-14C7.477 0 2 5.477 2 12s5.477 12 12 12 12-5.477 12-12S16.523 0 12 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Enjoy on your TV</h3>
              <p className="text-gray-400">Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Download your shows</h3>
              <p className="text-gray-400">Save your favorites easily and always have something to watch.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Watch everywhere</h3>
              <p className="text-gray-400">Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                question: "What is MovieFlix?",
                answer: "MovieFlix is a streaming service that offers a wide variety of award-winning TV shows, movies and documentaries on thousands of internet-connected devices."
              },
              {
                question: "How much does MovieFlix cost?",
                answer: "Watch MovieFlix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $8.99 to $15.99 a month."
              },
              {
                question: "Where can I watch?",
                answer: "Watch anywhere, anytime. Sign in with your MovieFlix account to watch instantly on the web or on any internet-connected device."
              }
            ].map((faq, index) => (
              <details key={index} className="bg-gray-800 p-6 rounded cursor-pointer">
                <summary className="text-lg font-semibold">{faq.question}</summary>
                <p className="mt-4 text-gray-300">{faq.answer}</p>
              </details>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg mb-6">Ready to watch? Enter your email to create or restart your membership.</p>
            <Link to="/signup" className="btn-primary px-8 py-3 text-lg">
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-red-600 text-xl font-bold mb-4">MOVIEFLIX</div>
              <p>Your ultimate streaming destination</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; 2024 MovieFlix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
