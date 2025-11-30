import React from 'react';

const HeroContent: React.FC = () => {
  return (
    <div className="text-center mb-12">
      {/* Upper tagline */}
      <p className="text-xs uppercase tracking-widest text-gray-600 mb-3 font-sans">
        ARE YOUR PRODUCTS ACNE SAFE?
      </p>

      {/* Main title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight text-shine mb-4">
        <span className="italic" style={{ color: '#8FAE3D' }}>
          acne-triggering
        </span>{' '}
        ingredient checker
      </h1>

      {/* New descriptive subtitle */}
      <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
        Upload your skincare product's ingredient list to instantly identify
        acne-causing ingredients and get personalized dermatologist insights
      </p>
    </div>
  );
};

export default HeroContent;
