// import AboutUs from "@/ui/components/home/AboutUs";
import HeroPage from "@/ui/components/home/HeroPage";
import OurProcess from "@/ui/components/home/OurProcess";
import OurService from "@/ui/components/home/OurService";
import Popular from "@/ui/components/home/Popular";
import B2BPrinting from "@/ui/components/ui-migration/home/B2BPrinting";
import HeroNewVersion from "@/ui/components/ui-migration/home/Hero";
import OurMission from "@/ui/components/ui-migration/home/OurMission";
import OurProduct from "@/ui/components/ui-migration/home/OurProduct";
import WhyChooseUs from "@/ui/components/ui-migration/home/WhyChooseUs";


export const metadata = {
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({ params }: { params: { channel: string } }) {

	const version = process.env.NEXT_PUBLIC_UI_VERSION || "1";


	return (
		<section className="min-h-screen w-full max-w-[100vw] mx-auto relative ">
			{version === "1" && (
				<>
					<HeroPage />
					{/* <SpecialOffer /> */}
					{/* <AboutUs /> */}
					<OurProcess />
					<OurService channel={params.channel} />
					{/* <Statistics/> */}
					<Popular />
					{/* <Subscribe /> */}
				</>
			)}
			{version === "2" && (
				<>
					<HeroNewVersion channel={params.channel} />
					<OurProduct channel={params.channel} />
					<OurMission />
					<B2BPrinting />
					<WhyChooseUs />
				</>
			)}
		</section>
	);
}
