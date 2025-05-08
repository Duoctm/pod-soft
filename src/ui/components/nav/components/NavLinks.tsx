 
import { NavLink } from "./NavLink";

export const NavLinks = async ({ channel }: { channel: string }) => {
	console.log("channel", channel);
	return (
		<>
			<NavLink href="/">Home</NavLink>
			{/* <NavLink href="/catalog">Catalog</NavLink> */}
			<NavLink href="/service">Service</NavLink>
			<NavLink href="/products">Order</NavLink>
			<NavLink href="/support">Support</NavLink>
		</>
	);
};
