import React from 'react';

const AdditionalInfoSection: React.FC = () => {
  return (
    <div className="mb-12 space-y-4 text-gray-700 leading-relaxed max-w-3xl">
      <p className="font-semibold">
        The first step to clearer skin? Making sure your routine is free of
        hidden acne triggers.
      </p>
      <p>
        We get it—it's tough to keep track of what's what. That's why we teamed
        up with dermatologists and skincare experts to create this easy-to-use
        checker to help you easily spot sneaky triggers and potential
        acne-causing ingredients in your skincare lineup.
      </p>
      <p className="text-sm italic text-gray-600">
        Since everyone's skin is unique, we always recommend checking in with a
        medical professional for advice that's just right for you.
      </p>
    </div>
  );
};

export default AdditionalInfoSection;
