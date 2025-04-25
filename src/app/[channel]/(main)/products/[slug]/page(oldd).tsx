'use client';

import React, { useState } from 'react';
import { product } from '../../../../../../public/test_data';

interface PageProps {
  params: {
    slug: string;
    channel: string;
  };
}

export default function Page({ params }: PageProps) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);
  console.log('Decoded slug:', decodedSlug);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  console.log('Decoded slug:', decodedSlug); // Log the decoded slug 

  const currentImages = product.image_of_color[selectedColor].images;

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleColorClick = (index: number) => {
    setSelectedColor(index);
    setSelectedIndex(0); // Reset ảnh lớn về ảnh đầu tiên khi đổi màu
  };

  const handlePrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === currentImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-[88%] p-8 flex flex-col md:flex-row gap-8 bg-[#f6ede8] relative min-h-[90vh]">
        {/* Block 1 - Image section */}
        <div className="w-full md:w-2/5">
          <div className="relative w-full h-[60%] aspect-square mb-4 border rounded-md overflow-hidden bg-[#f1edfb]">
            <img
              src={currentImages[selectedIndex]}
              alt={`Image ${selectedIndex + 1}`}
              className="object-contain w-full h-full"
            />
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 text-2xl rounded-full shadow hover:bg-gray-100 flex items-center justify-center bg-[#aeacc1] w-12 h-12"
            >
              〈
            </button>

            <button
              onClick={handleNext}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-2xl rounded-full shadow hover:bg-gray-100 flex items-center justify-center bg-[#aeacc1] w-12 h-12"
            >
              〉
            </button>
          </div>

          <div className="flex justify-center gap-2">
            {currentImages.slice(0, 4).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => handleThumbnailClick(index)}
                className={`w-16 h-16 object-contain cursor-pointer border-2 rounded ${
                  selectedIndex === index ? 'border-black' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Block 2 - Product Details */}
        <div className="w-full md:w-3/5 rounded p-6 text-gray-800 bg-[#f6ede8]">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {/* Features */}
          <div className="mt-6 mb-4">
            <h2 className="text-sm font-semibold mb-2">Features</h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Color Options */}
          <div className="mt-6 mb-4">
            <h2 className="text-sm font-semibold mb-2">Color</h2>
            <div className="flex gap-3">
              {product.image_of_color.map((colorObj, index) => (
                <div
                  key={index}
                  onClick={() => handleColorClick(index)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                    selectedColor === index
                      ? 'border-black'
                      : 'border-gray-300'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colorObj.color_code }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-6 mb-4">
            <h2 className="text-sm font-semibold mb-2">Size</h2>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size, index) => (
                <div
                  key={index}
                  className="w-7 h-7 flex items-center justify-center rounded bg-[#d9d9d9] text-[#000000] text-sm cursor-pointer hover:bg-gray-200"
                >
                  {size?.[0]}
                </div>
              ))}
              <div className="w-7 h-7 ml-4 text-sm text-black-600 flex items-center font-bold">
                Destinations
              </div>
            </div>
          </div>

          <div className="mt-6 mb-4">
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <div
                  className="w-7 h-7 flex items-center justify-center rounded bg-[#ebe9e9] text-[#000000] text-sm cursor-pointer hover:bg-gray-200"
                >
                  {size?.[1]}
                </div>
              ))}

              <div className="ml-4 text-sm text-black-600 flex items-center font-medium">
                123 Location street, 2203: 2 days
              </div>
            </div>
          </div>

          <div className="mt-6 mb-4">
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <div
                  className="w-7 h-7 flex items-center justify-center rounded bg-[#ebe9e9] text-[#000000] text-sm cursor-pointer hover:bg-gray-200"
                >
                  {size?.[2]}
                </div>
              ))}

              <div className="ml-4 text-sm text-black-600 flex items-center font-medium">
                456 Alternate way, 95112: 2 days
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="absolute bottom-8 left-8 flex gap-4">
          In Stock: 500+
        </div>
        <div className="absolute bottom-8 right-8 flex gap-4">
          <button className="bg-[#39377a] text-white px-6 py-2 rounded hover:opacity-90">
            Add to Cart
          </button>
          <button className="bg-[#827d9f] text-white px-6 py-2 rounded hover:opacity-90">
            Design
          </button>
        </div>
      </div>
    </div>
  );
}
