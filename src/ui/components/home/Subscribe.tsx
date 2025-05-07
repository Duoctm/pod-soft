export default function Subscribe() {
    return (
        <div className="w-full bg-[#263246] py-16">
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-16 lg:px-[120px] flex flex-col gap-[10px]">
                <div className="w-full flex flex-col md:flex-row justify-between items-center">
                    <div className="text-white font-bold text-[20px] sm:text-[22px] md:text-[24px] leading-[140%] tracking-[0%] max-w-[300px] sm:max-w-[350px] md:max-w-[327px] text-center md:text-left">
                        Join Our Newsletter to Keep Up To Date With Us!
                    </div>

                    <div className="w-full sm:w-[450px] md:max-w-[523px]   flex flex-col sm:flex-row gap-[16px] items-center justify-center md:justify-start mt-4 md:mt-0">
                        <input
                            type="email"
                            placeholder="Enter your Email"
                            className="w-full sm:w-[324px] h-[50px] text-[#909098] text-[14px] leading-[24px] tracking-[0%] 
                                pt-[10px] pr-[32px] pb-[10px] pl-[32px] border-none rounded-[8px]"
                        />

                        <button
                            className="w-full sm:w-[183px] h-[49px] bg-[#8B3958] text-[#F3F3FF] font-semibold text-[14px] rounded-[8px] shadow-[0px_8px_24px_0px_#FD8C6F40] 
                                pt-[20px] pr-[38px] pb-[20px] pl-[38px] flex items-center justify-center mt-4 sm:mt-0"
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
