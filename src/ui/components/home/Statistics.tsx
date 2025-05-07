/*export default function Statistics() {
    interface StaticsType{
        number: string,
        description: string
    }
    const staticses : StaticsType[] = [
        {number: "15+", description: "Years of Experience"},
        {number: "98%", description: "Satisfaction Rate"},
        {number: "50+", description: "Diverse Product"},
        {number: "10K", description: "Printing Capacity"}
    ];
    return (
    <div className="w-full  bg-[#FFEDE9]">
      <div className="w-full max-w-[1440px] h-[1167px] mx-auto p-6 py-12 relative">
        
        <div className="absolute top-[142px] left-[120px] w-[378px] h-[148px]">
         
          <div className="text-[#EF816B] text-[18px] font-semibold tracking-[0.16em] uppercase w-[185px] h-[13px]">
            Statistic
          </div>
  
          
          <div className="text-[#212131] text-[50px] font-bold leading-[120%] w-[378px] h-[120px] mt-[15px]">
            ZoomPrints in Number
          </div>
        </div>
  
    
        <div className="absolute top-[174px] left-[628px] w-[692px] h-[78px]">
          <p className="text-[#868686] text-[16px] font-normal leading-[26px] text-right">
            Odio at elit mauris neque nisl odio elementum viverra sollicitudin. Ante sed aliquam et duis eu mauris. Tristique quisque amet turpis sed interdum non sollicitudin vulputate mi. Interdum in et ut sed semper ornare fames.
          </p>
        </div>
  

        <div
          className="absolute top-[351px] left-[120px] w-[488px] h-[745px] rounded-[16px] bg-cover bg-center"
          style={{
            backgroundImage: 'url("/images/modern-photo-studio-displaying-photography-prints-with-large-format-printer.png")',
          }}
        ></div>

<div className="absolute top-[533px] left-[730px] w-[590px] h-[418px]">
 
  <div className="absolute inset-0">

    <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-[#868686] opacity-50 transform -translate-x-1/2"></div>
    
    <div className="absolute left-0 right-0 top-1/2 h-px border-t border-[#868686] opacity-50 transform -translate-y-1/2"></div>
  </div>


  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-x-[60px] gap-y-[32px] p-[31px]">
  {staticses.map(({ number, description }, i) => (
  <div key={i} className="w-[194px] h-[162px] flex flex-col gap-[10px]">
    
    <div className="w-[132px] h-[98px] text-[#271E32] font-semibold text-[82px] leading-[120%]">
      {number}
    </div>

    <div className="w-[102px] h-[16px] bg-[#8B3958] rounded-[174px]"></div>

    <div className="w-[194px] h-[28px] text-[#868686] font-semibold text-[20px] leading-[140%]">
      {description}
    </div>
  </div>
))}
  </div>
</div>



      </div>
      </div>
    );
  }
  */

  export default function Statistics() {
    interface StaticsType {
      number: string;
      description: string;
    }
  
    const staticses: StaticsType[] = [
      { number: "15+", description: "Years of Experience" },
      { number: "98%", description: "Satisfaction Rate" },
      { number: "50+", description: "Diverse Product" },
      { number: "10K", description: "Printing Capacity" },
    ];
  
    return (
      <div className="w-full bg-[#FFEDE9]">
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          {/* Section Title */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-10">
            <div className="w-full md:w-1/2">
              <div className="text-[#EF816B] text-sm md:text-[18px] font-semibold tracking-[0.16em] uppercase mb-2">
                Statistic
              </div>
              <div className="text-[#212131] text-3xl md:text-[50px] font-bold leading-[120%]">
                ZoomPrints in Number
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <p className="text-[#868686] text-sm md:text-[16px] leading-[26px] text-left md:text-right">
                Odio at elit mauris neque nisl odio elementum viverra sollicitudin. Ante sed aliquam et duis eu mauris. Tristique quisque amet turpis sed interdum non sollicitudin vulputate mi. Interdum in et ut sed semper ornare fames.
              </p>
            </div>
          </div>
  
          {/* Image and Stats */}
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <div
                className="rounded-[16px] bg-cover bg-center h-[300px] sm:h-[400px] md:h-[500px] lg:h-[745px]"
                style={{
                  backgroundImage:
                    'url("/images/modern-photo-studio-displaying-photography-prints-with-large-format-printer.png")',
                }}
              ></div>
            </div>
  
            {/* Statistics Grid */}
            <div className="w-full lg:w-1/2 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 hidden md:block">
                <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-[#868686] opacity-50 transform -translate-x-1/2"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px border-t border-[#868686] opacity-50 transform -translate-y-1/2"></div>
              </div>
  
              {/* Items */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-8 p-4 sm:p-6 md:p-8">
                {staticses.map(({ number, description }, i) => (
                  <div key={i} className="flex flex-col items-start gap-2">
                    <div className="text-[#271E32] font-semibold text-[48px] sm:text-[60px] md:text-[82px] leading-[120%]">
                      {number}
                    </div>
                    <div className="w-16 h-1.5 bg-[#8B3958] rounded-full"></div>
                    <div className="text-[#868686] font-semibold text-base sm:text-lg md:text-[20px] leading-[140%]">
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  