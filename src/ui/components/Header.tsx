import { Logo } from "./Logo";
import { Nav } from "./nav/Nav";
import Wrapper from "./wrapper";

export function Header({ channel }: { channel: string }) {
	return (
		<header className="sticky top-0 z-20 rounded-b-xl border-b bg-white shadow-md md:rounded-none md:shadow-none lg:py-0">
			<Wrapper className="flex items-center lg:h-[142px] py-4 lg:py-0">
				<Logo />
				<Nav channel={channel} />
			</Wrapper>
		</header>
	);
}
