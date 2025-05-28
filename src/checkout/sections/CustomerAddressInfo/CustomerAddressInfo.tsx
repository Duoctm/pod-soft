import { Address } from "@/gql/graphql";
import React from "react";

interface AddressCheckoutFormProps {
	shippingAddress: Address;
  // openDialog: boolean;
  openDialog: ()=> void;
}

const CustomerAddressInfo = ({ shippingAddress, openDialog }: AddressCheckoutFormProps) => {
	return (
		<div className="flex flex-1 flex-col gap-y-2 rounded-lg bg-white py-2 shadow-sm">
			<h3 className="font-medium">Shipping Address</h3>
			<div className="w-full space-y-2">
				<div className="space-y-1 text-sm">
					{shippingAddress.companyName && <p>{shippingAddress.companyName}</p>}
					<p>{shippingAddress.streetAddress1}</p>
					{shippingAddress.phone && <p className="pt-1">{shippingAddress.phone}</p>}
				</div>
				<div className="flex gap-x-2 italic text-blue-500 hover:text-blue-700" onClick={openDialog}>
					<button >Edit address</button>
				</div>
			</div>
		</div>
	);
};

export default CustomerAddressInfo;
