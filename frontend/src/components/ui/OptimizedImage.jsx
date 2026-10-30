import React, { useState, useEffect } from 'react';

const DEFAULT_COMPANY_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/960px-Flag_of_India.svg.png?20240827082344";

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
  const [currentSrc, setCurrentSrc] = useState(src || DEFAULT_COMPANY_LOGO);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src || DEFAULT_COMPANY_LOGO);
    setIsLoaded(false);
    setFallbackAttempted(false);
  }, [src]);

  const constructImageUrl = (imageSrc) => {
    if (!imageSrc) return DEFAULT_COMPANY_LOGO;
    if (imageSrc.startsWith('http')) return imageSrc;
    
    if (imageSrc.startsWith('/uploads/')) {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${backendUrl}${imageSrc}`;
    }
    
    return imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
  };

  const finalSrc = constructImageUrl(currentSrc);

  const handleError = () => {
    if (!fallbackAttempted && finalSrc !== DEFAULT_COMPANY_LOGO) {
      setFallbackAttempted(true);
      setCurrentSrc(DEFAULT_COMPANY_LOGO);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center bg-white ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : 'auto'
      }}
    >
      {/* 1. Blur Placeholder Layer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
          <div className="w-full h-full animate-pulse bg-gradient-to-br from-slate-50 to-slate-100" />
        </div>
      )}
      
      <img
        src={finalSrc}
        alt={alt || 'Company Logo'}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`
          duration-300 ease-in-out transition-all
          ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}
          ${className}
        `}
        style={{ 
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
};

export default OptimizedImage;
