import React from 'react';

interface HeroSectionProps {
  imageUrl: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ imageUrl }) => {
  return (
    <div className="w-screen max-h-[240px] overflow-hidden flex items-center justify-center">
      <img
        src={imageUrl}
        alt="Skincare Products with Water Droplets"
        className="w-full object-cover object-center"
      />
    </div>
  );
};

export default HeroSection;
