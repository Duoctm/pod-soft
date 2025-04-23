// components/ServiceFeatureCard.tsx
import React from 'react';
import { ArrowRightCircle } from 'lucide-react';

// Định nghĩa interface cho props của component
interface ServiceFeatureCardProps {
  image: string;
  title: string;
  subtitle: string;
  features: string[];
  revert?: boolean; // Thuộc tính để hoán đổi vị trí hình ảnh và nội dung
}

export default function ServiceFeatureCard({ 
  image, 
  title, 
  subtitle, 
  features,
  revert = false, // Mặc định là false
}: ServiceFeatureCardProps) {
  return (
    <div className={`flex flex-col ${revert ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center justify-between gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 rounded-lg`}>
      {/* Phần hình ảnh */}
      <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
        <img
          src={image}
          alt={title}
          className="rounded-xl sm:rounded-2xl shadow-md w-full h-auto object-cover"
          loading="lazy" // Thêm lazy loading cho hiệu suất tốt hơn
        />
      </div>
 
      {/* Phần nội dung */}
      <div className="w-full lg:w-1/2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 text-base sm:text-lg mb-4">{subtitle}</p>
        <hr className="mb-4 sm:mb-6" />
        <ul className="space-y-3 sm:space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 sm:gap-3">
              <ArrowRightCircle className="text-black flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">{feature}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}