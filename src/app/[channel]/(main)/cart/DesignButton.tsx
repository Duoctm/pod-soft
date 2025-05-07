'use client'; 
type DesignButtonProps = {
    colorId: string;
    productId: string,
};

export function DesignButton({ productId, colorId }: DesignButtonProps) {
   // const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        window.location.replace(`design/1/${productId}/${colorId}`);
      }}
      
      className="rounded border border-neutral-300 px-3 py-1 text-sm font-medium text-white bg-black hover:bg-black"
    >
      Design
    </button>
  );
}
