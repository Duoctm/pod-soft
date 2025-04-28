import Image from "next/image";
import Link from "next/link";

export async function Footer({channel} : {channel:string}) {
  return (
    <footer className="w-full bg-[#1C1C1C] py-8 text-white flex items-center flex-1">
      <div className="mx-auto max-w-screen-2xl px-4 w-full min-h-[30vh] lg:h-[20vh]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <Image 
              src="/images/main-bg.png" 
              alt="Logo" 
              width={200} 
              height={200}
              className="hover:opacity-90 transition-opacity duration-300"
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-6 justify-center">
            {[
              { href: `/${channel}/catalog/tee`, label: "Tee" },
              { href: `/${channel}/catalog/mugs`, label: "Mugs" },
              { href: `/${channel}/catalog/fleece`, label: "Fleece" },
              { href: `/${channel}/catalog/tumbler`, label: "Tumblers" },
              { href: `/${channel}/catalog/ornament`, label: "Ornament" },
              { href: `/${channel}/catalog/shorts`, label: "Shorts" },
              { href: `/${channel}/catalog/tote-bag`, label: "Totebag" },
              { href: `/${channel}/catalog/poster`, label: "Poster" },
              { href: `/${channel}/catalog/tank`, label: "Tank" },
              { href: `/${channel}/catalog/Jacket`, label: "Jacket" },
              { href: `/${channel}/catalog/sticker`, label: "Stickers" },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-[#FD8C6E] hover:text-white hover:underline transition-colors duration-300 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

      </div>
    </footer>
  );
}
