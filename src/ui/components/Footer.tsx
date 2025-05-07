// import Image from "next/image";
// import Link from "next/link";

import Image from "next/image";
import Wrapper from "./wrapper";

// export async function Footer({channel} : {channel:string}) {
//   return (
//     <footer className="w-full bg-[#1C1C1C] py-8 text-white flex items-center flex-1">
//       <div className="mx-auto max-w-screen-2xl px-4 w-full min-h-[30vh] lg:h-[20vh]">
//         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//           {/* Logo */}
//           <div className="shrink-0">
//             <Image 
//               src="/images/main-bg.png" 
//               alt="Logo" 
//               width={200} 
//               height={200}
//               className="hover:opacity-90 transition-opacity duration-300"
//             />
//           </div>

//           {/* Navigation */}
//           <nav className="flex flex-wrap items-center gap-6 justify-center">
//             {[
//               { href: `/${channel}/catalog/tee`, label: "Tee" },
//               { href: `/${channel}/catalog/mugs`, label: "Mugs" },
//               { href: `/${channel}/catalog/fleece`, label: "Fleece" },
//               { href: `/${channel}/catalog/tumbler`, label: "Tumblers" },
//               { href: `/${channel}/catalog/ornament`, label: "Ornament" },
//               { href: `/${channel}/catalog/shorts`, label: "Shorts" },
//               { href: `/${channel}/catalog/tote-bag`, label: "Totebag" },
//               { href: `/${channel}/catalog/poster`, label: "Poster" },
//               { href: `/${channel}/catalog/tank`, label: "Tank" },
//               { href: `/${channel}/catalog/Jacket`, label: "Jacket" },
//               { href: `/${channel}/catalog/sticker`, label: "Stickers" },
//             ].map((item, index) => (
//               <Link
//                 key={index}
//                 href={item.href}
//                 className="text-[#FD8C6E] hover:text-white hover:underline transition-colors duration-300 text-sm font-medium"
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </nav>
//         </div>

//       </div>
//     </footer>
//   );
// }
export async function Footer({ channel }: { channel: string }) {
  console.log(channel);
  return (
    <div className="bg-[#1C1C1C] py-16 flex flex-col">
      <Wrapper className="flex items-center justify-between">
        <div className="flex flex-col gap-y-5 ">
          <Image
            src="/images/main-logo.png"
            alt="Logo"
            className="object-cover"
            width={150}
            height={100}
          />

          <p className="max-w-[387px] w-full text-white text-[16px] leading-[26px] tracking-[0%] font-[400]">
            Netus feugiat vitae enim enim in viverra. Id at sagittis cras pretium
            dictum nec netus. Ante dolor quis convallis.
          </p>
        </div>
        <div className=" grid grid-cols-3 gap-16">

          <div className="  flex flex-col gap-[24px]">
            <div className="  text-[#FFFFFF] text-[20px] font-[700] leading-[140%]">
              Company
            </div>


            <div className="  flex flex-col gap-[10px]">
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                About Us
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Services
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Our Projects
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Pricing
              </div>
            </div>
          </div>

          <div className=" flex flex-col gap-[24px]">

            <div className="  text-[#FFFFFF] text-[20px] font-[700] leading-[140%]">
              Resources
            </div>
            <div className="  flex flex-col gap-[10px]">
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Gift Cards
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Design Tutorial
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                How to - Blog
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Spotify Podcast
              </div>
            </div>


          </div>


          <div className=" flex flex-col gap-[24px]">
            <div className="w-[92px] h-[28px] text-[#FFFFFF] text-[20px] font-[700] leading-[140%]">
              Help
            </div>


            <div className="w-[160px] min-h-[134px] flex flex-col gap-[10px]">
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Customer Support
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Delivery Details
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Terms & Conditions
              </div>
              <div className="w-full h-[26px] text-[#FFFFFF] text-[16px] font-[400] leading-[26px]">
                Privacy Policy
              </div>
            </div>


          </div>
        </div>
      </Wrapper >
      <hr className="border-t border-[#424255] my-6" />

      <div className="text-center text-[#F3F3FF] text-sm">
        © 2025 ZoomPrints. All rights reserved.
      </div>
    </div >

  );
}