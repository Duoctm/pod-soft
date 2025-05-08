'use client'; // Bắt buộc ở ngay dòng đầu tiên
import { fetchCheckoutLineMetadata } from './data';
type ViewDesignButtonProps = {
  lineId: string;
  checkout: any,
  params: any,

};

export function ViewDesignButton({ lineId, checkout, params, }: ViewDesignButtonProps) {
  // const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        localStorage.setItem(
          "cart",
          JSON.stringify({
            params: params
          }),
        );
        const metadata = await fetchCheckoutLineMetadata(checkout, lineId) as any;
        localStorage.setItem('designInfor', JSON.stringify(metadata));
        localStorage.setItem('cartId', lineId);
        window.location.replace(`design/2/${metadata.productId}/${metadata.colorValue}`);
      }}

      className="rounded border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
    >
      View Design
    </button>
  );
}
