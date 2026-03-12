"use client";

export function GoogleAdsSafetyHeader() {
  return (
    <div style={{ backgroundColor: '#ecfef5' }} className="dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-2 text-sm">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-emerald-700 dark:text-emerald-400">
            <strong>FlyVietnam.Help</strong> is a private, third-party travel consultancy. Not affiliated with any government.
          </p>
        </div>
      </div>
    </div>
  );
}
