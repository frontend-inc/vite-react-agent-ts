import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-transparent border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo Column */}
          <div className="md:col-span-1">
            <img
              src="https://sb.frontend.co/storage/v1/object/public/app/projects/04ade745-b0d3-4541-966e-6943f814d85d/logo.png"
              alt="Personal Day Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* About Column */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Our Story
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Our Science
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Our Advisory Board
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Our Mission
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Information
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Ingredient Checker
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Store Locator
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-gray-600">hello@personalday.com</p>
              <p className="text-gray-600">Weekdays, 9am - 5pm PST</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Social Media Icons */}
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a
              href="#"
              className="text-gray-800 hover:text-gray-600 transition-colors"
            >
              <i className="ri-instagram-line ri-lg"></i>
            </a>
            <a
              href="#"
              className="text-gray-800 hover:text-gray-600 transition-colors"
            >
              <i className="ri-tiktok-line ri-lg"></i>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-gray-600 text-sm">© 2025, Personal Day.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
