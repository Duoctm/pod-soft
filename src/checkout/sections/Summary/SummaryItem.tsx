import { type ReactNode } from "react";
// eslint-disable-next-line no-restricted-imports
import Image from "next/image";
import { getSummaryLineProps } from "./utils";
import { type CheckoutLine, type CheckoutLineFragment } from "@/checkout/graphql";
import { PhotoIcon } from "@/checkout/ui-kit/icons";
import { mapService, type PrintInfo } from "@/app/[channel]/(main)/cart/CartPage";

export type SummaryLine = CheckoutLineFragment;

interface SummaryItemProps {
	line: CheckoutLine;
	children: ReactNode;

}

export const SummaryItem = ({ line, children }: SummaryItemProps) => {
	console.log("🚀 SummaryItem.tsx:18 - line:", line);

	const { productName, productImage } = getSummaryLineProps(line);
	const printing = line.metadata?.find((meta) => meta.key === "printing");
	const validJson = printing?.value.replace(/'/g, '"') as string;
	const parsePrinting: PrintInfo | null = printing ? (JSON.parse(validJson) as PrintInfo) : null;
	const { breakdown: { line_services: lineServices, sides } } = parsePrinting!


	const printTech = sides.find(i => i.technology)

	const mapServices = mapService(lineServices, line.totalPrice.gross.currency)

	return (
		<li key={line.id} className="flex border-b py-2 last:border-none" data-testid="SummaryItem">
			<div className="aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-neutral-50 md:h-24 md:w-24 md:bg-white">
				{productImage ? (
					<Image
						width={250}
						height={250}
						src={productImage.url}
						alt={productImage.alt ?? ""}
						className="h-full w-full object-contain  bg-cover"
					/>
				) : (
					<PhotoIcon />
				)}
			</div>
			<div className="relative flex flex-1 flex-col justify-between pl-4">
				<div className="flex justify-between justify-items-start gap-4">
					<div className="flex flex-col gap-y-1">
						<p className="font-bold">{productName}</p>
						<p className="text-xs text-neutral-500">Printing Technology: <span className="font-bold">{printTech?.technology}</span></p>
						<p className="text-xs text-gray-600 flex text-balance items-start gap-2 flex-1">Services:<span className="font-semibold flex gap-2 flex-1 flex-wrap">
							{
								mapService && mapService.length > 0 ? (mapServices.map((i, idx) => {
									return <div key={idx}
										className="px-2 py-1 rounded-full"
										style={{
											backgroundColor: i.color
										}}
									>
										{i.mapPrice}
									</div>
								})) : "None"
							}
						</span></p>

					</div>
					{children}
				</div>
			</div>
		</li>
	);
};
