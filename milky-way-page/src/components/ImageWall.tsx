import React from 'react';

interface ImageWallProps {
  images?: string[];
}

export const ImageWall: React.FC<ImageWallProps> = ({ images = [] }) => {
  // Generate sample images if none provided
  const sampleImages =
    images.length > 0
      ? images
      : Array.from(
          { length: 15 },
          (_, i) => `https://picsum.photos/200/200?random=${i + 1}`
        );

  return (
    <div className="h-full overflow-y-auto p-4 animate-fade-in">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sampleImages.map((src, index) => (
          <div key={index} className="modern-image-item cursor-pointer group">
            <img
              src={src}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-[20px] transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 bg-white/90 rounded-2xl flex items-center justify-center modern-card">
                  <span className="text-lg">👁️</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        className="modern-fab bottom-20 right-4 lg:bottom-8"
        style={
          {
            '--bg-color': '#e66d86',
            '--bg-color-dark': '#d85a7a',
          } as React.CSSProperties
        }
      >
        +
      </button>
    </div>
  );
};
