import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container px-4 mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold text-brand-primary">
                <img
                  src="/images/logo/logo.png"
                  alt="Hustly Logo"
                  className="h-10 max-sm:h-7 w-auto "
                />
              </span>
            </Link>
            <p className="text-gray-600 mb-4 max-w-md">
              Your platform to hustle smartly. Learn powerful systems and tools
              designed to help you grow, build, and unlock new digital
              possibilities. For creators, doers, and forward-thinkers ready to
              take action. Built for those who take action.
            </p>
          </div>

          {/* <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to=""
                  className="text-gray-600 hover:text-brand-primary transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  to=""
                  className="text-gray-600 hover:text-brand-primary transition-colors"
                >
                  eBooks
                </Link>
              </li>
              <li>
                <Link
                  to=""
                  className="text-gray-600 hover:text-brand-primary transition-colors"
                >
                  Affiliate Dashboard
                </Link>
              </li>
            </ul>
          </div> */}

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/policy"
                  className="text-gray-600 hover:text-brand-primary transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/policy"
                  className="text-gray-600 hover:text-brand-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/policy"
                  className="text-gray-600 hover:text-brand-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Hustly. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link to="#" className="text-gray-500 hover:text-brand-primary">
              Facebook
            </Link>
            <Link to="#" className="text-gray-500 hover:text-brand-primary">
              Twitter
            </Link>
            <Link to="#" className="text-gray-500 hover:text-brand-primary">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
