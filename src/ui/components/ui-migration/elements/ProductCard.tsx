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
        <div className="group relative rounded-xl shadow-md transition-all duration-300 bg-white group max-w-[400px] w-full">
            {/* Image */}
            <div className="relative h-40 w-full top-">
                <Image src={image} alt={title} fill className="object-cover" />
            </div>
            <div className="relative flex flex-col h-full bg-white">



                <div className="absolute -top-12 left-4 w-24 h-24 rounded-full bg-[#273245] flex items-center justify-center border-4 border-white shadow-md">

                    <Image src={icon} alt={title} width={48} height={48} />
                </div>


                <div className="pt-[76px] pb-5 px-4">
                    <h3 className="text-sm font-bold text-[#273245]">{title}</h3>
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
            </div>
            <div className="h-2 group-hover:bg-[#f9d2c0]"></div>
        </div>
    );
};
