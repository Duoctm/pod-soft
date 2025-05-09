import { Suspense} from "react";
import { CartNavItem } from "./components/CartNavItem";
import { NavLinks } from "./components/NavLinks";
import { MobileMenu } from "./components/MobileMenu";
import { SearchBar } from "./components/SearchBar";
import { UserMenuContainer } from "./components/UserMenu/UserMenuContainer";

export const Nav = ({ channel }: { channel: string }) => {
	return (
		<nav className="ml-14 flex w-full gap-4 lg:gap-6" aria-label="Main navigation">
			<ul className="hidden gap-4 overflow-x-auto whitespace-nowrap md:flex lg:gap-8 lg:px-0">
				<NavLinks channel={channel} />
			</ul>
			<div className="ml-auto flex items-center justify-center whitespace-nowrap lg:gap-6">
				<div className="hidden lg:flex">
					<SearchBar channel={channel} />
				</div>
			</div>
			<div className="flex items-center gap-2 md:gap-4 lg:gap-6">
				<Suspense fallback={<div className="w-8" />}>
					<UserMenuContainer />
				</Suspense>
				<Suspense fallback={<div className="w-6" />}>
					<CartNavItem channel={channel} />
				</Suspense>
			</div>
			<Suspense>
				<MobileMenu>
					<SearchBar channel={channel} />
					<NavLinks channel={channel} />
				</MobileMenu>
			</Suspense>
		</nav>
	);
};
