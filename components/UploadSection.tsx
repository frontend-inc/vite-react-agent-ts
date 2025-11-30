import React, { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';

interface UploadSectionProps {
  onUploadComplete: (url: string | null, userMessage: string) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUploadComplete }) => {
  const [userMessage, setUserMessage] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Allow submission with just a message, or with an image
    if (!uploadedImageUrl && !userMessage.trim()) {
      alert('Please either upload an image or type a message');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the parent function to trigger processing
      // Pass the image URL if available, or null if only message
      onUploadComplete(uploadedImageUrl, userMessage);

      // Reset the form
      setUploadedImageUrl(null);
      setUserMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetUpload = () => {
    setUploadedImageUrl(null);
    setUserMessage('');
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Upload Your Product or Ask a Question
      </h3>

      <ImageUploader onUploadComplete={handleImageUpload} />

      {/* Chat Box & Submit Section */}
      <div className="mt-8 space-y-4">
        {/* Preview of uploaded image (if exists) */}
        {uploadedImageUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Uploaded Image:
            </p>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded image preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleResetUpload}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Remove image
              </button>
            </div>
          </div>
        )}

        {/* Chat Box */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {uploadedImageUrl
                ? 'Ask a follow-up question (optional)'
                : 'Your question or product description'}
            </label>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder={
                uploadedImageUrl
                  ? 'e.g., Is salicylic acid safe? What about the percentages?'
                  : 'Ask anything about ingredients, acne, skincare routines...'
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FAE3D] focus:border-transparent resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              You can ask questions without uploading an image, or upload an
              image without a question.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={
                isSubmitting || (!uploadedImageUrl && !userMessage.trim())
              }
              className="flex-1 px-6 py-3 bg-[#8FAE3D] text-white font-semibold rounded-full hover:bg-[#7d9735] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {uploadedImageUrl ? 'Analyzing...' : 'Processing...'}
                </>
              ) : (
                <>
                  <i className="ri-search-line"></i>
                  {uploadedImageUrl ? 'Analyze Ingredients' : 'Get Help'}
                </>
              )}
            </button>
            {(uploadedImageUrl || userMessage) && (
              <button
                type="button"
                onClick={handleResetUpload}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSection;
