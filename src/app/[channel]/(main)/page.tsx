// import AboutUs from "@/ui/components/home/AboutUs";
import HeroPage from "@/ui/components/home/HeroPage";
import dynamic from "next/dynamic";

const OurProcess = dynamic(() => import("@/ui/components/home/OurProcess"), {
	loading: () => <p>Loading...</p>
});

const OurService = dynamic(() => import("@/ui/components/home/OurService"), {
	loading: () => <p>Loading...</p>
});

const Popular = dynamic(() => import("@/ui/components/home/Popular"), {
	loading: () => <p>Loading...</p>
});

export const metadata = {
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({ params }: { params: { channel: string } }) {
	console.log("params", params);

	return (
		<section className="min-h-screen w-screen overflow-y-auto overflow-x-hidden  after:relative ">
			<HeroPage />
			{/* <SpecialOffer /> */}
			{/* <AboutUs /> */}
			<OurProcess />
			<OurService />
			{/* <Statistics/> */}
			<Popular />
			{/* <Subscribe /> */}
		</section>
	);
}
