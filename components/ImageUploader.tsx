import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploaderProps {
  onUploadComplete?: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFiles = async (file: File) => {
    // Reset states
    setError(null);

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }

    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('app')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('app').getPublicUrl(fileName);

      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Error uploading image');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-gray-300 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 shadow-sm ${
          isDragActive
            ? 'border-[#8FAE3D] bg-[#8FAE3D]/5 scale-[1.02] shadow-md'
            : 'hover:border-[#8FAE3D] hover:bg-gray-50 hover:shadow-md'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleInputChange}
          accept="image/*"
        />

        <div className="flex flex-col items-center justify-center py-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragActive
              ? 'Drop your image here'
              : 'Drag & drop your ingredient photo'}
          </h4>
          <p className="text-gray-600 mb-4">
            or <span className="text-[#8FAE3D] font-medium">browse files</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <i className="ri-error-warning-line text-xl flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="font-medium">Upload failed</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
