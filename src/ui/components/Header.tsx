import { Logo } from "./Logo";
import { Nav } from "./nav/Nav";
import Wrapper from "./wrapper";

export function Header({ channel }: { channel: string }) {
	return (
		<header className="sticky top-0 z-20 shadow-md backdrop-blur-md">
			<Wrapper className="flex items-center  lg:h-[142px]">
				<Logo />
				<Nav channel={channel} />
			</Wrapper>
		</header>

		// <header className="px-4 md:px-2 top-0  backdrop-blur-md  w-screen z-[9998] bg-transparent h-[72px] items-center flex justify-center transition will-change-auto mt-4">
		// 		<div className="w-full main-content items-center flex justify-between mt-2 py-3 2xl:py-4 px-6 2xl:px-8 gap-2 rounded-xl border-[1px] border-gray-iron-700 bg-gray-iron-900 relative max-w-screen-2xl h-[78px]">
		// 			<Logo />
		// 			<Nav channel={channel} />
		// 		</div>
		// </header>
	);
}
