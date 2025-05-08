'use client';
type DesignButtonProps = {
  colorId: string;
  productId: string,
  params: any,
  selectedVariantId: string,
  quantity: number
};

export function DesignButton({ productId, colorId, params, selectedVariantId, quantity }: DesignButtonProps) {
  // const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        JSON.stringify({
          params: params,
          selectedVariantId: selectedVariantId,
          quantity: quantity,
        }),
          window.location.replace(`design/1/${productId}/${colorId}`);
      }}

      className="rounded border border-neutral-300 px-3 py-1 text-sm font-medium text-white bg-black hover:bg-black"
    >
      Design
    </button>
  );
}
