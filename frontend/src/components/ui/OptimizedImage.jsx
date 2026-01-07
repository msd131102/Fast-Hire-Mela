import React, { useState, useEffect } from 'react';

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

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const constructImageUrl = (imageSrc) => {
    if (!imageSrc) return null;
    if (imageSrc.startsWith('http')) return imageSrc;
    
    if (imageSrc.startsWith('/uploads/')) {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${backendUrl}${imageSrc}`;
    }
    
    return imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
  };

  const generateSrcSet = (fullSrc) => {
    if (!fullSrc || hasError || fullSrc.startsWith('http')) return '';
    
    const extensions = ['.jpg', '.jpeg', '.png'];
    const hasImageExtension = extensions.some(ext => fullSrc.toLowerCase().includes(ext));
    
    if (!hasImageExtension) return fullSrc;
    
    const baseName = fullSrc.replace(/\.[^/.]+$/, '');
    return `${baseName}.webp 1x, ${baseName}@2x.webp 2x`;
  };

  const finalSrc = constructImageUrl(src);

  if (hasError || !finalSrc) {
    return (
      <div 
        className={`bg-slate-50 flex flex-col items-center justify-center border border-slate-100 rounded-xl ${className}`}
        style={{ width: width || '100%', height: height || '100%' }}
      >
        <div className="w-1/3 h-1/3 bg-slate-200 rounded-full animate-pulse mb-1" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">No Brand</span>
      </div>
    );
  }

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
      
      <picture className="w-full h-full flex items-center justify-center">
        <source
          type="image/webp"
          srcSet={generateSrcSet(finalSrc)}
          sizes={sizes}
        />
        
        <img
          src={finalSrc}
          alt={alt || 'Company Logo'}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`
            duration-700 ease-in-out transition-all
            ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}
            ${className}
          `}
          style={{ 
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;