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

  // Generate WebP and fallback sources
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || hasError) return '';
    
    // If it's an external URL, return as-is
    if (baseSrc.startsWith('http')) {
      return baseSrc;
    }
    
    // For local images, generate different sizes
    const extensions = ['.jpg', '.jpeg', '.png'];
    const hasImageExtension = extensions.some(ext => baseSrc.includes(ext));
    
    if (!hasImageExtension) {
      return baseSrc;
    }
    
    // Generate WebP version with fallback
    const baseName = baseSrc.replace(/\.[^/.]+$/, '');
    return `${baseName}.webp 1x, ${baseName}@2x.webp 2x`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Fallback placeholder
  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image not available</span>
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
          srcSet={generateSrcSet(src)}
          sizes={sizes}
        />
        
        {/* Fallback for older browsers */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          style={{ 
            objectFit: 'cover',
            width: width || '100%',
            height: height || 'auto'
          }}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;
