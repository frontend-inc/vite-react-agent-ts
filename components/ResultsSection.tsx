import React from 'react';
import SimpleMarkdown from '@/components/SimpleMarkdown';

interface ResultsSectionProps {
  imageUrl: string | null;
  extractedText: string | null;
  onReset: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  imageUrl,
  extractedText,
  onReset,
}) => {
  // Don't show anything if there's no content
  if (!imageUrl && !extractedText) {
    return null;
  }

  // If there's just an image (no extraction text), show it as preview
  if (imageUrl && !extractedText) {
    return (
      <div className="mb-8">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-4">Preview:</p>
          <div className="flex justify-center">
            <div className="relative rounded-lg overflow-hidden shadow-md border border-gray-200 max-w-md w-full">
              <img
                src={imageUrl}
                alt="Uploaded ingredient list preview"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's extracted text, show results
  if (extractedText) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {imageUrl ? 'Ingredient Results' : 'Response'}
          </h3>
        </div>

        <div className="bg-gray-50 flex flex-col space-y-2 rounded-lg p-6 mb-4 border border-gray-200">
          {imageUrl && (
            <div className="mt-0 flex justify-center mb-6">
              <div className="relative rounded-lg overflow-hidden shadow-md border border-gray-200 w-full max-w-md">
                <div className="aspect-w-9 aspect-h-16">
                  <img
                    src={imageUrl}
                    alt="Uploaded ingredient list"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}

          <SimpleMarkdown content={extractedText} />
        </div>

        <div className="text-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-white border-2 border-[#8FAE3D] text-[#8FAE3D] font-semibold rounded-full hover:bg-[#8FAE3D]/5 transition-colors"
          >
            {imageUrl ? 'Upload another image' : 'Submit another request'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ResultsSection;
