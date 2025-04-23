import Image from "next/image";
import Link from "next/link";

export async function Footer({ channel }: { channel: string }) {
  console.log("channel", channel);
  return (
    <footer className="px-4 w-full bg-gray-950 border-gray-800 flex items-start justify-center border-t bg-cover bg-center bg-no-repeat pb-12 pt-12 text-white">
      <div className="max-w-screen-2xl w-full flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-9">
          <div className="flex flex-col gap-8">
            <div className="flex w-full flex-col items-start gap-3">
              <Image src={"/images/zp-bg-white.png"} alt="" width={100} height={100} />
            </div>
          </div>

          {/* Catalog Section */}
          <div className="flex w-full flex-wrap text-sm font-semibold text-white md:flex-1">
            <div className="text-text-note flex basis-1/2 flex-col items-start gap-2 pr-2 text-base font-normal leading-6 md:basis-1/4 md:items-end md:gap-4 xl:basis-1/4">
              <span className="text-inter text-gray-500 text-sm font-semibold md:leading-5">
                Catalog
              </span>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Tee
              </Link>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Fleece
              </Link>
              <Link href="/catalog/short" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Shorts
              </Link>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Stickers
              </Link>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Tumblers
              </Link>
            </div>

            {/* Company Section */}
            <div className="text-text-note flex basis-1/2 flex-col items-start gap-2 text-base font-normal leading-6 md:basis-1/4 md:items-end md:gap-4 xl:basis-1/4">
              <span className="text-inter text-gray-500 text-sm font-semibold md:leading-5">
                Company
              </span>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                About us
              </Link>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Careers
              </Link>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Facilities
              </Link>
              <Link href="/" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Contact
              </Link>
            </div>

            {/* Resources Section */}
            <div className="text-text-note mt-8 flex basis-1/2 flex-col items-start gap-2 text-base font-normal leading-6 md:mt-0 md:basis-1/4 md:items-end md:gap-4 xl:basis-1/4">
              <span className="text-inter text-gray-500 text-sm font-semibold md:leading-5">
                Resources
              </span>
              <Link href="https://docs.swiftpod.com/" rel="noopener noreferrer" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                API
              </Link>
              <Link href="/contact?tab=customer" className="text-gray-500 text-ibm whitespace-nowrap hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Help center
              </Link>
            </div>

            {/* Social Section */}
            <div className="text-text-note mt-8 flex basis-1/2 flex-col items-start gap-2 text-base font-normal leading-6 md:mt-0 md:basis-1/4 md:items-end md:gap-4 xl:basis-1/4">
              <span className="text-inter text-gray-500 text-sm font-semibold md:leading-5">
                Social
              </span>
              <Link href="/" rel="noopener noreferrer" target="_blank" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                X
              </Link>
              <Link href="/" rel="noopener noreferrer" target="_blank" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                LinkedIn
              </Link>
              <Link href="/" rel="noopener noreferrer" target="_blank" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Facebook
              </Link>
              <Link href="/" rel="noopener noreferrer" target="_blank" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Instagram
              </Link>
              <Link href="/" rel="noopener noreferrer" target="_blank" className="text-gray-500 text-ibm hover:underline active:opacity-80 md:text-sm 2xl:text-base">
                Youtube
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
