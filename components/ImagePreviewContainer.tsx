import React from 'react';

interface ImagePreviewContainerProps {
  uploadedImageUrl: string | null;
  onRemove: () => void;
}

const ImagePreviewContainer: React.FC<ImagePreviewContainerProps> = ({
  uploadedImageUrl,
  onRemove,
}) => {
  if (!uploadedImageUrl) return null;

  return (
    <div className="flex gap-3 items-start">
      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 flex-shrink-0 bg-gray-100 shadow-sm">
        <img
          src={uploadedImageUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full hover:bg-gray-100 transition-colors text-gray-800 hover:text-gray-900 shadow-lg flex items-center justify-center"
        >
          <i className="ri-close-line text-sm font-bold"></i>
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewContainer;
