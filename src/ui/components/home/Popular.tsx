/*interface PopularyType{
    off: number,
    image: string,
    name: string
}
const populars : PopularyType[] = [
    {off: 15, name: "T-shirts", image: "/images/unrecognizable-person-working-iron-sublimation-printing-concept-graphic-design.png"},
    {off: 0, name: "Business Cards", image: "/images/business-card-stack.png"},
    {off: 10, name: "Postcards", image: "/images/cute-bee-blossoms-bring-springtime-love-generated-by-ai.png"},
    {off: 0, name: "Stickers", image: "/images/image.png"}
];
export default function Popular() {
    return (
      <div className="w-full bg-[#FFFFFF] h-[621px]">
        <div className="w-full max-w-[1440px] mx-auto relative">
         
          <div className="absolute top-[97px] left-[120px] w-[484px] h-[88px] flex flex-col gap-[16px]">
           
            <div className="w-[281px] h-[13px] text-[#EF816B] font-semibold text-[18px] leading-[100%] tracking-[0.16em] uppercase">
              POPULAR PRODUCTS
            </div>
  
           
            <div className="w-[484px] h-[60px] text-[#212131] font-bold text-[50px] leading-[120%]">
              ZoomPrints Picks
            </div>
          </div>
  
         
          <button
            className="absolute top-[116px] left-[1137px] w-[183px] h-[49px] bg-[#8B3958] rounded-[8px] flex items-center justify-center gap-[10px] shadow-[0px_8px_24px_0px_#FD8C6F40] px-[38px] py-[20px]"
          >
            <div className="text-[#F3F3FF] font-semibold text-[14px] leading-[100%] text-center">
              See All
            </div>
          </button>
          <div className="absolute top-[270px] left-[120px] w-[1199.68px] h-[253.9px] flex gap-[20.33px]">
          {populars.map((item, index) => (
  <div
    key={index}
    className="w-[284.67px] h-[248.9px] flex flex-col gap-[24.4px]"
  >
   
    <div className="relative w-[284.67px] h-[213.5px] rounded-[10.17px] bg-[#FAF7F7] overflow-hidden">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover rounded-[10.17px]"
      />
      {item.off > 0 && (
        <div className="absolute top-[20.33px] left-[20px] bg-[#FD8C6F] rounded-[4.07px] px-[10.17px] py-[5px] min-w-[80.33px] h-[31.33px] flex items-center justify-center">
        <span className="whitespace-nowrap text-white font-bold text-[16.27px] leading-[100%]">
          {item.off}% off
        </span>
      </div>
      
      )}
    </div>

    
    <div className="flex gap-[12.2px] items-center">
     
      <div className="text-[#FD8C6F] font-bold text-[16px] leading-[100%]">
        {item.name}
      </div>

     
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="44.73"
        height="11"
        viewBox="0 0 44.73 11"
        fill="none"
      >
        <path
          d="M0 5.5H42 M42 5.5L38 1 M42 5.5L38 10"
          stroke="#FD8C6F"
          strokeWidth="1.02"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
))}

        </div>

        </div>
      </div>
    );
  }
  */
export default function Popular() {
    interface PopularyType {
        off: number;
        image: string;
        name: string;
    }

    const populars: PopularyType[] = [
        {
            off: 15,
            name: "T-shirts",
            image:
                "/images/unrecognizable-person-working-iron-sublimation-printing-concept-graphic-design.png",
        },
        {
            off: 0,
            name: "Business Cards",
            image: "/images/business-card-stack.png",
        },
        {
            off: 10,
            name: "Postcards",
            image:
                "/images/cute-bee-blossoms-bring-springtime-love-generated-by-ai.png",
        },
        {
            off: 0,
            name: "Stickers",
            image: "/images/image.png",
        },
    ];

    return (
        <div className="w-full bg-[#FFFFFF] py-[80px] px-6">
            <div className="w-full max-w-[1200px] mx-auto relative">
                {/* Heading and Button */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-[16px] mb-[60px]">
                    <div className="flex flex-col gap-[16px]">
                        <div className="text-[#EF816B] font-semibold text-[18px] leading-[100%] tracking-[0.16em] uppercase">
                            POPULAR PRODUCTS
                        </div>

                        <div className="text-[#212131] font-bold text-[36px] md:text-[50px] leading-[120%] max-w-[484px]">
                            ZoomPrints Picks
                        </div>
                    </div>

                    <button className="w-[183px] h-[49px] bg-[#8B3958] rounded-[8px] flex items-center justify-center gap-[10px] shadow-[0px_8px_24px_0px_#FD8C6F40] px-[38px] py-[20px]">
                        <div className="text-[#F3F3FF] font-semibold text-[14px] leading-[100%] text-center">
                            See All
                        </div>
                    </button>
                </div>

                {/* Popular Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[20px]">
                    {populars.map((item, index) => (
                        <div
                            key={index}
                            className="w-full flex flex-col gap-[24.4px]"
                        >
                            {/* Image + Tag */}
                            <div className="relative w-full h-[213.5px] rounded-[10.17px] bg-[#FAF7F7] overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-[10.17px]"
                                />
                                {item.off > 0 && (
                                    <div className="absolute top-[20.33px] left-[20px] bg-[#FD8C6F] rounded-[4.07px] px-[10.17px] py-[5px] min-w-[80.33px] h-[31.33px] flex items-center justify-center">
                                        <span className="whitespace-nowrap text-white font-bold text-[16.27px] leading-[100%]">
                                            {item.off}% off
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Text + Arrow */}
                            <div className="flex gap-[12.2px] items-center">
                                <div className="text-[#FD8C6F] font-bold text-[16px] leading-[100%]">
                                    {item.name}
                                </div>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="44.73"
                                    height="11"
                                    viewBox="0 0 44.73 11"
                                    fill="none"
                                >
                                    <path
                                        d="M0 5.5H42 M42 5.5L38 1 M42 5.5L38 10"
                                        stroke="#FD8C6F"
                                        strokeWidth="1.02"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
