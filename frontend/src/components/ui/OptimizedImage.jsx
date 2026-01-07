import React, { useState } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Function to construct full URL for backend images
  const constructImageUrl = (imageSrc) => {
    if (!imageSrc) return null;
    
    // If it's already a full URL, return as-is
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }
    
    // If it starts with /uploads/, it's a backend relative path
    if (imageSrc.startsWith('/uploads/')) {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${backendUrl}${imageSrc}`;
    }
    
    // If it's a relative path starting with /, it's a frontend asset
    if (imageSrc.startsWith('/')) {
      return imageSrc;
    }
    
    // Otherwise, treat as relative path
    return `/${imageSrc}`;
  };

  // Generate WebP and fallback sources
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || hasError) return '';
    
    const fullSrc = constructImageUrl(baseSrc);
    
    // If it's an external URL, return as-is
    if (fullSrc.startsWith('http')) {
      return fullSrc;
    }
    
    // For local images, generate different sizes
    const extensions = ['.jpg', '.jpeg', '.png'];
    const hasImageExtension = extensions.some(ext => fullSrc.includes(ext));
    
    if (!hasImageExtension) {
      return fullSrc;
    }
    
    // Generate WebP version with fallback
    const baseName = fullSrc.replace(/\.[^/.]+$/, '');
    return `${baseName}.webp 1x, ${baseName}@2x.webp 2x`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  const finalSrc = constructImageUrl(src);

  // Fallback placeholder
  if (hasError || !finalSrc) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-xs text-center">No Logo</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      
      <picture>
        {/* WebP source for modern browsers */}
        <source
          type="image/webp"
          srcSet={generateSrcSet(finalSrc)}
          sizes={sizes}
        />
        
        {/* Fallback for older browsers */}
        <img
          src={finalSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          style={{ 
            objectFit: 'contain',
            width: width || '100%',
            height: height || 'auto'
          }}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;
