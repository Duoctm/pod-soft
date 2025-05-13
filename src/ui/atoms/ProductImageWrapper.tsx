import NextImage, { type ImageProps } from "next/image";

export const ProductImageWrapper = (props: ImageProps) => {
	return (
		<div className="aspect-square overflow-hidden bg-neutral-50">
			<NextImage {...props} className="object-cover bg-cover bg-center object-center p-2" />
		</div>
	);
};
