// import Trusted from "@/ui/components/home/Trusted";
// import Comprehensive from "@/ui/components/home/Comprehensive";
// import Hero from "@/ui/components/home/Hero";
// import Printing from "@/ui/components/home/Printing";
// import About from "@/ui/components/home/About";
import Promotion from "@/ui/components/home/Promotion";
import GetStarted from "@/ui/components/home/GetStarted";
import BusinessProcess from "@/ui/components/home/BusinessProcess";
import OurStory from "@/ui/components/home/OurStory";

export const metadata = {
	title: "ZoomPrint - Print on Demand",
	description:
		"ZoomPrint is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({ params }: { params: { channel: string } }) {
	console.log("params", params);
	return (
		<section className="min-h-screen w-screen overflow-y-auto overflow-x-hidden  after:relative ">
	 
			{/* <Hero/>
			<About/>
			<Printing/>
			<Comprehensive/>
			<Trusted/> */}


			<Promotion></Promotion>
			<GetStarted></GetStarted>
			<BusinessProcess></BusinessProcess>
			<OurStory></OurStory>
		</section>
	);
}
