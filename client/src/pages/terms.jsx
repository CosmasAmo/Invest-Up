import { useEffect } from 'react';
import Footer from '../components/footer';
import Navbar from '../components/navbar';

function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service | Invest Up';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Terms of Service and Privacy Policy</h1>
          <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-400 italic">Effective Date: 07/06/2018</p>
        </div>
        
        <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-800 px-8 py-6 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">InvestUp Trading Company</h2>
                <p className="text-blue-300 text-sm">Legal Documentation</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {/* Terms of Service Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5a2 2 0 00-2 2v12a2 2 0 002 2h5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-blue-400">Terms of Service</h2>
              </div>
              
              <div className="pl-11">
                <p className="mb-6 text-gray-300 leading-relaxed">Welcome to InvestUp Trading Company. By accessing or using our Platform, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Acceptance of Terms
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">By registering, accessing, or using the Platform, you acknowledge that you have read, understood, and agreed to these Terms of Service, as well as our Privacy Policy. These terms constitute a legally binding agreement between you and the Platform.</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                    Eligibility
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">To use the Platform, you must:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Be at least 18 years old or the legal age of majority in your jurisdiction.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Have the legal capacity to enter into a binding agreement.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Comply with all applicable laws and regulations in your jurisdiction.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                    Investment Services
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">The Platform offers cryptocurrency-based investment services, allowing users to invest funds and earn daily profits of up to 5% from Monday to Friday. The following terms apply:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span><span className="font-medium text-white">Profit Calculation:</span> Profits are calculated based on the investment amount and are credited daily (Monday to Friday).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span><span className="font-medium text-white">Withdrawals:</span> Users may request withdrawals subject to the Platform&apos;s withdrawal policies and processing times.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span><span className="font-medium text-white">Risks:</span> Cryptocurrency investments are inherently risky. You acknowledge that the value of cryptocurrencies can fluctuate, and there is no guarantee of profits. You invest at your own risk.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
                    User Responsibilities
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">You agree to:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Provide accurate and complete information during registration.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Maintain the security of your account credentials.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Not use the Platform for illegal or unauthorized purposes.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Comply with all applicable laws and regulations.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">5</span>
                    Prohibited Activities
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">You are prohibited from:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Engaging in fraudulent, illegal, or unethical activities.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Using the Platform to launder money or finance illegal activities.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Attempting to disrupt or compromise the security of the Platform.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Creating multiple accounts to exploit the Platform&apos;s services.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">6</span>
                    Termination
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">We reserve the right to suspend or terminate your account at any time, without notice, for violations of these Terms of Service or for any other reason at our sole discretion.</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">7</span>
                    Limitation of Liability
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">The Platform is not liable for:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Any losses or damages resulting from your use of the Platform.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Fluctuations in cryptocurrency values.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Technical issues, including but not limited to server downtime, hacking, or data breaches.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">8</span>
                    Amendments
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">We reserve the right to modify these Terms of Service at any time. Continued use of the Platform after changes constitutes acceptance of the revised terms.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Privacy Policy Section */}
            <div className="pt-8 border-t border-slate-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-blue-400">Privacy Policy</h2>
              </div>
              
              <div className="pl-11">
                <p className="mb-6 text-gray-300 leading-relaxed">Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Information We Collect
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">We may collect the following information:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Personal details (e.g., name, email address, phone number).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Financial information (e.g., cryptocurrency wallet addresses).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Technical data (e.g., IP address, browser type, device information).</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                    How We Use Your Information
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">We use your information to:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Provide and improve our services.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Process transactions and investments.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Communicate with you regarding your account and our services.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Comply with legal and regulatory requirements.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                    Data Security
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">We implement industry-standard security measures to protect your information. However, no system is completely secure, and we cannot guarantee absolute security.</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
                    Third-Party Services
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">We may use third-party services to process transactions or analyze data. These third parties are obligated to protect your information and use it only for the purposes we specify.</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">5</span>
                    Cookies and Tracking
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">We use cookies and similar technologies to enhance your experience on the Platform. You can disable cookies in your browser settings, but this may affect your ability to use certain features.</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">6</span>
                    Data Retention
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">We retain your information for as long as necessary to provide our services or as required by law.</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">7</span>
                    Your Rights
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-4">You have the right to:</p>
                    <ul className="list-none mb-6 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Access, update, or delete your personal information.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Opt-out of marketing communications.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Withdraw consent for data processing (where applicable).</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">8</span>
                    Changes to This Policy
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">We may update this Privacy Policy from time to time. Any changes will be posted on the Platform, and your continued use constitutes acceptance of the revised policy.</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    Contact Us
                  </h3>
                  <div className="pl-10 text-gray-300 leading-relaxed">
                    <p className="mb-6">If you have any questions or concerns about these Terms of Service or Privacy Policy, please contact us at: <br />
                    <span className="text-blue-400 font-medium">Email: support@investup.com</span></p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-slate-900 rounded-xl border border-slate-700 text-sm text-gray-400">
              <div className="flex items-start mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-semibold text-yellow-500">Disclaimer:</p>
              </div>
              <p className="pl-7">This document is a general template and may not cover all legal requirements for your specific jurisdiction. Consult a legal professional to ensure compliance with applicable laws and regulations. Cryptocurrency investments are highly speculative and involve significant risk. Users should conduct their own research and seek professional advice before investing.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Terms; 