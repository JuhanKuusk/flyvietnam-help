"use client";

import { useState } from "react";

export function GoogleAdsSafetyHeader() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#ecfef5] dark:bg-emerald-900/30 border-b-2 border-emerald-300 dark:border-emerald-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Notice - Always Visible */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Important Travel Notice
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
              <strong>FlyVietnam.Help</strong> is a private, third-party travel consultancy and concierge service.
              We are <strong>NOT</strong> affiliated with the Vietnamese Government, the Vietnam Immigration Department,
              or any governmental body.
            </p>

            {/* Expandable Section */}
            <div className={`mt-3 space-y-3 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
              {/* Official Government Alternative */}
              <div className="p-3 !bg-white dark:!bg-gray-800 rounded-lg !border-2 !border-black dark:!border-white">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Official Government Alternative:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Travelers may choose to arrange their own entry requirements directly through the official Vietnam
                  government portal at no additional service cost. The official government e-Visa fee is{" "}
                  <strong>$25 USD</strong> for single entry or <strong>$50 USD</strong> for multiple entry.
                </p>
                <p className="text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Apply directly at: </span>
                  <a
                    href="https://evisa.xuatnhapcanh.gov.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    evisa.xuatnhapcanh.gov.vn
                  </a>
                </p>
              </div>

              {/* Our Service */}
              <div className="p-3 !bg-white dark:!bg-gray-800 rounded-lg !border-2 !border-black dark:!border-white">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">
                  Our Concierge Service:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When using our platform, you are paying for professional assistance services, including{" "}
                  <strong>24/7 WhatsApp support</strong>, <strong>document review</strong>, and{" "}
                  <strong>expedited processing coordination</strong>.
                </p>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="sm:hidden mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Show less
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Read more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
