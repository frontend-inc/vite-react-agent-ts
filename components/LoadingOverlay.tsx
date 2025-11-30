import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#8FAE3D] border-t-[#8FAE3D]/20 rounded-full animate-spin"></div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analyzing Ingredients
          </h3>

          <p className="text-gray-600">
            Our AI is scanning your product for acne triggers...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
