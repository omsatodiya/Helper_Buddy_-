import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  // Default image to show on error
  const fallbackImage = '/placeholder-image.jpg'; // Create a placeholder image in your public folder

  // Check if the image is an external URL
  const isExternal = src.startsWith('http') || src.startsWith('https');

  if (error || !src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }

  if (isExternal) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => setError(true)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false}
      quality={75}
    />
  );
};

export default SafeImage; 