import Image from "next/image";
import Wrapper from "./wrapper";

// Common styles for text elements
const textStyles = {
  base: "text-white text-[14px] md:text-[16px] font-[400] leading-[24px] md:leading-[26px]",
  heading: "text-[#FFFFFF] text-[18px] md:text-[20px] font-[700] leading-[140%]",
};

// Footer navigation data
const footerNavigation = [
  {
    title: "Company",
    links: ["About Us", "Services", "Our Projects", "Pricing"],
  },
  {
    title: "Resources",
    links: ["Gift Cards", "Design Tutorial", "How to - Blog", "Spotify Podcast"],
  },
  {
    title: "Help",
    links: [
      "Customer Support",
      "Delivery Details",
      "Terms & Conditions",
      "Privacy Policy",
    ],
  },
];

interface FooterProps {
  channel: string;
}

export async function Footer({ channel }: FooterProps) {
  console.log(channel)
  const renderNavigationColumn = ({ title, links }: typeof footerNavigation[0]) => (
    <div className="flex flex-col gap-[16px] md:gap-[24px]">
      <div className={textStyles.heading}>{title}</div>
      <div className="flex flex-col gap-[8px] md:gap-[10px]">
        {links.map((link, index) => (
          <div key={index} className={textStyles.base}>
            {link}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#1C1C1C] py-8 md:py-16 flex flex-col">
      <Wrapper className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">
        <div className="flex flex-col gap-y-5 w-full md:w-auto">
          <Image
            src="/images/main-logo.png"
            alt="Logo"
            className="object-cover"
            width={150}
            height={100}
          />
          <p className="max-w-full md:max-w-[387px] text-white text-[14px] md:text-[16px] leading-[24px] md:leading-[26px] tracking-[0%] font-[400]">
            Netus feugiat vitae enim enim in viverra. Id at sagittis cras pretium
            dictum nec netus. Ante dolor quis convallis.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 w-full md:w-auto">
          {footerNavigation.map((section, index) => (
            <div key={index}>{renderNavigationColumn(section)}</div>
          ))}
        </div>
      </Wrapper>
      <hr className="border-t border-[#424255] my-4 md:my-6" />
      <div className="text-center text-[#F3F3FF] text-xs md:text-sm">
        © 2025 ZoomPrints. All rights reserved.
      </div>
    </div>
  );
}