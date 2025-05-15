import AboutUs from "@/ui/components/home/AboutUs";
import HeroPage from "@/ui/components/home/HeroPage";
import OurProcess from "@/ui/components/home/OurProcess";
import OurService from "@/ui/components/home/OurService";
import Popular from "@/ui/components/home/Popular";
import SpecialOffer from "@/ui/components/home/SpecialOffer";

export const metadata = {
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({ params }: { params: { channel: string } }) {
	console.log("params", params);
	return (
		<section className="min-h-screen w-screen overflow-y-auto overflow-x-hidden  after:relative ">
			<HeroPage />
			<SpecialOffer />
			<AboutUs />
			<OurProcess />
			<OurService />
			{/* <Statistics/> */}
			<Popular />
			{/* <Subscribe /> */}
		</section>
	);
}
