import React from 'react';
import { ToolPart } from '@/lib/hooks/use-chat';

interface ImageOutput {
  url: string;
}

interface EditImageOutput {
  images?: ImageOutput[];
}

interface MessageToolEditImageProps {
  part: ToolPart;
}

const MessageToolEditImage: React.FC<MessageToolEditImageProps> = ({ part }) => {
  const output = part.output as EditImageOutput | undefined;
  const images = output?.images;

  if (!images || images.length === 0) {
    return null;
  }

  // Single image display
  if (images.length === 1) {
    return (
      <div className="rounded-lg overflow-hidden">
        <img
          src={images[0].url}
          alt="Edited image"
          className="w-full max-w-md rounded-lg object-cover"
        />
      </div>
    );
  }

  // 2x2 grid for multiple images
  return (
    <div className="grid grid-cols-2 gap-2 max-w-md">
      {images.slice(0, 4).map((image, index) => (
        <div key={index} className="aspect-square rounded-lg overflow-hidden">
          <img
            src={image.url}
            alt={`Edited image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default MessageToolEditImage;
