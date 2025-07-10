// components/ProductCard.tsx
import { MoveRight } from "lucide-react";
import Image from "next/image";

type ProductCardProps = {
    title: string;
    description: string;
    icon: string;
    image: string;
    linkHref?: string | null;
    linkText?: string;
};

export const ProductCard = ({
    title,
    description,
    icon,
    image,
    linkHref,
    linkText,
}: ProductCardProps) => {
    return (
        <div className="group relative rounded-xl shadow-md transition-all duration-300 bg-white max-w-[400px] w-full overflow-hidden h-full flex flex-col">
            {/* Image */}
            <div className="relative h-40 w-full">
                <Image src={image} alt={title} fill className="object-cover" />
            </div>

            {/* Nội dung */}
            <div className="relative flex flex-col flex-1 bg-white">
                <div className="absolute -top-12 left-4 w-24 h-24 rounded-full bg-[#273245] flex items-center justify-center border-4 border-white shadow-md">
                    <Image src={icon} alt={title} width={48} height={48} />
                </div>

                <div className="pt-[76px] px-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-[#273245]">{title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{description}</p>

                    <div className="mt-auto pt-4">
                        {linkHref ? (
                            <a
                                href={linkHref}
                                className="text-[#f98d62] text-xs font-semibold inline-block hover:underline"
                            >
                                {linkText} <MoveRight className="inline-block ml-1" />
                            </a>
                        ) : (
                            <span className="text-[#f98d62] text-xs font-semibold inline-block hover:underline">
                                {linkText}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-2 group-hover:bg-[#f9d2c0] transition-all duration-300"></div>
        </div>
    );
};
