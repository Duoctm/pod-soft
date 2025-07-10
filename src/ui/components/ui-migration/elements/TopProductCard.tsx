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
    bestSeller?: boolean;
};

export const TopProductCard = ({
    title,
    description,
    image,
    linkHref,
    linkText,
    bestSeller,
}: ProductCardProps) => {
    return (
        <div className="group relative rounded-xl shadow-md transition-all duration-500 bg-white group max-w-[400px] w-full overflow-hidden h-96">
            {/* Image */}

            {
                bestSeller && (
                    <div className="z-40 absolute top-2 right-2 rounded-full bg-[#273245] text-white text-xs font-semibold px-2 py-1">
                        Best Seller
                    </div>
                )
            }

            <Image src={image} alt={title} fill className="object-contain bg-top" />
            <div className="flex flex-col bg-white absolute bottom-0">
                <div className="py-5 px-4">
                    <h3 className="text-xl  font-bold text-[#273245]">{title}</h3>
                    <p className="text-xs text-gray-600 mt-1 min-h-[3rem]">{description}</p>
                    {linkHref ? (<a
                        href={linkHref}
                        className="text-[#f98d62] text-xs font-semibold mt-2 inline-block hover:underline"
                    >
                        {linkText} <MoveRight className="inline-block ml-1" />
                    </a>) : <span
                        className="text-[#f98d62] text-xs font-semibold mt-2 inline-block hover:underline"
                    >
                        {linkText}
                    </span>}
                </div>
                <div className="h-2 group-hover:bg-[#f9d2c0] transition-all duration-500"></div>
            </div>
        </div>
    );
};
