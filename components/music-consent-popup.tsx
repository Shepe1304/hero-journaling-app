"use client";

import { useState, useEffect } from "react";

export const MusicConsentPopup = ({
  onConsent,
}: {
  onConsent: (allowed: boolean) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after a slight delay (better UX)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold text-amber-900 mb-4">
          Background Music
        </h3>
        <p className="text-gray-700 mb-6">
          Would you like to enable atmospheric background music for this
          experience?
        </p>
        <p className="text-gray-600 mb-6">
          (Stop it any time via the bottom-right controls.)
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              onConsent(false);
              setIsVisible(false);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            No Thanks
          </button>
          <button
            onClick={() => {
              onConsent(true);
              setIsVisible(false);
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Enable Music
          </button>
        </div>
      </div>
    </div>
  );
};
