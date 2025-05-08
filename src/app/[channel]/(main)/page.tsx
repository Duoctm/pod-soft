import dynamic from "next/dynamic";

import HeroPage from "@/ui/components/home/HeroPage";

const AboutUs = dynamic(() => import("@/ui/components/home/AboutUs"), {
	loading: () => <div>Loading...</div>,
});

const OurProcess = dynamic(() => import("@/ui/components/home/OurProcess"), {
	loading: () => <div>Loading...</div>,
});

const OurService = dynamic(() => import("@/ui/components/home/OurService"), {
	loading: () => <div>Loading...</div>,
});

const SpecialOffer = dynamic(() => import("@/ui/components/home/SpecialOffer"), {
	loading: () => <div>Loading...</div>,
});

// const Statistics = dynamic(() => import("@/ui/components/home/Statistics"), {
//   loading: () => <div>Loading...</div>
// });
const Popular = dynamic<any>(() => import("@/ui/components/home/Popular"), {
	loading: () => <div>Loading...</div>,
});
const Subscribe = dynamic(() => import("@/ui/components/home/Subscribe"), {
	loading: () => <div>Loading...</div>,
});

export const metadata = {
	title: "ZoomPrint",
	description: "ZoomPrint is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({ params }: { params: { channel: string } }) {
	console.log("params", params);
	return (
		<section className="min-h-screen w-screen overflow-y-auto overflow-x-hidden  after:relative ">
			<HeroPage />
			<AboutUs />
			<OurProcess />
			<OurService />
			<SpecialOffer />
			{/* <Statistics/> */}
			<Popular />
			<Subscribe />
		</section>
	);
}
