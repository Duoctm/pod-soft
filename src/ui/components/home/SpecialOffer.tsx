import Wrapper from "../wrapper";

/*export default function SpecialOffer() {
    return (
        <div  className="w-full bg-[#263246]">
            <div className="w-full max-w-[1440px] h-[542px] flex justify-center mx-auto">
           
            <div className="absolute text-center" style={{ width: '753px', height: '143px', top: '120px', left: '50%', transform: 'translateX(-50%)' }}>
            <p className="font-bold text-[56px] leading-[71.25px] text-white tracking-[0%] text-center">
                Get <span className="text-[#FD8C6F]">Special Offer</span> For
            </p>
            <p className="font-bold text-[56px] leading-[71.25px] text-white tracking-[0%] text-center">
                Today With ZoomPrints
            </p>
            </div>

          
            <div className="absolute text-center" style={{ top: '280px', width: '600px', height: '34px', left: '50%', transform: 'translateX(-50%)' }}>
            <p className="font-normal text-[24px] leading-[140%] text-[#BCBBC9] tracking-[0%]">
                See, Touch, and Feel the Excellence of ZoomPrints
            </p>
            </div>

          
            <div className="absolute" style={{ top: '370px', left: '50%', width: '183.99998474121094px', height: '50.21857833862305px', transform: 'translateX(-50%)' }}>
            <div className="w-full h-[50px] bg-[#FD8C6F] rounded-[8.04px] shadow-[0px_4px_8px_rgba(0,0,0,0.1)] flex justify-center items-center">
                <button className="w-full h-[100%] font-semibold text-[14.08px] text-[#F3F3FF] bg-transparent border-none outline-none cursor-pointer text-center">
                Learn More
                </button>
            </div>
            </div>
            </div>
        </div>
    );
  }
  */
  export default function SpecialOffer() {
    return (
        <div className="w-full bg-[#263246] py-[120px]">

         
      <Wrapper className="flex flex-col items-center justify-center"  >
        {/* <div className="w-full max-w-[1200px] h-[542px] flex justify-center mx-auto relative">
  
          Text 1
          <div className="absolute text-center top-[120px] left-1/2 transform -translate-x-1/2 w-[753px] md:w-[600px] sm:w-[90%]">
            <p className="font-bold text-[56px] leading-[71.25px] text-white tracking-[0%] text-center sm:text-[40px] md:text-[48px]">
              Get <span className="text-[#FD8C6F]">Special Offer</span> For
            </p>
            <p className="font-bold text-[56px] leading-[71.25px] text-white tracking-[0%] text-center sm:text-[40px] md:text-[48px]">
              Today With ZoomPrints
            </p>
          </div>
  
       
          <div className="absolute text-center top-[280px] left-1/2 transform -translate-x-1/2 w-[600px] sm:w-[90%] md:w-[500px]">
            <p className="font-normal text-[24px] leading-[140%] text-[#BCBBC9] tracking-[0%] sm:text-[18px]">
              See, Touch, and Feel the Excellence of ZoomPrints
            </p>
          </div>
  
     
          <div className="absolute top-[370px] left-1/2 transform -translate-x-1/2 w-[184px] sm:w-[150px] md:w-[160px]">
            <div className="w-full h-[50px] bg-[#FD8C6F] rounded-[8.04px] shadow-[0px_4px_8px_rgba(0,0,0,0.1)] flex justify-center items-center">
              <button className="w-full h-[100%] font-semibold text-[14.08px] text-[#F3F3FF] bg-transparent border-none outline-none cursor-pointer text-center sm:text-[12px]">
                Learn More
              </button>
            </div>
          </div>
  
        </div> */}
        
            <h3 className="max-w-[743px] w-full text-center font-bold text-[56px] leading-[71.25px] text-white">
            Get <span className="text-[#FD8C6F]">Special Offer</span> For
            Today With ZoomPrints
            </h3>
            <span className="font-normal text-[24px] leading-[140%] w-full text-center py-4 text-[#BCBBC9]">See, Touch, and Feel the Excellence of ZoomPrints</span>
            <button className="mt-14 px-12 py-5 rounded-md font-semibold text-[14.08px] text-[#F3F3FF]  border-none outline-none cursor-pointer text-center sm:text-[12px] bg-[#FD8C6F]">
                Learn More
              </button>
           
      </Wrapper>
      </div>
    );
  }
  