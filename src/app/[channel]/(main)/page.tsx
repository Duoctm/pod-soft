// import Trusted from "@/ui/components/home/Trusted";
// import Comprehensive from "@/ui/components/home/Comprehensive";
// import Hero from "@/ui/components/home/Hero";
// import Printing from "@/ui/components/home/Printing";
// import About from "@/ui/components/home/About";
// import Promotion from "@/ui/components/home/Promotion";
// import GetStarted from "@/ui/components/home/GetStarted";
// import BusinessProcess from "@/ui/components/home/BusinessProcess";
// import OurStory from "@/ui/components/home/OurStory";
import HeroPage from "@/ui/components/home/HeroPage";
import AboutUs from "@/ui/components/home/AboutUs";
import OurProcess from "@/ui/components/home/OurProcess";
import OurService from "@/ui/components/home/OurService";
import SpecialOffer from "@/ui/components/home/SpecialOffer";
import Statistics from "@/ui/components/home/Statistics";
import Popular from "@/ui/components/home/Popular";
import Subscribe from "@/ui/components/home/Subscribe";

export const metadata = {
	title: "ZoomPrint",
	description: "ZoomPrint is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({ params }: { params: { channel: string } }) {
	console.log("params", params);
	return (
		<section className="min-h-screen w-screen overflow-y-auto overflow-x-hidden  after:relative ">

			<HeroPage/>
			<AboutUs/>
			<OurProcess/>
			<OurService/>
			<SpecialOffer></SpecialOffer>
			<Statistics></Statistics>
			<Popular></Popular>
			<Subscribe></Subscribe>
		</section>
	);
}
