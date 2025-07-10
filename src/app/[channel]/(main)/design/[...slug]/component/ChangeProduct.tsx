import { useState, useEffect } from "react";
import ProductDetail from "../../../products/[slug]/productDetail";
import { ProductsPerPage } from "@/app/config";
import Wrapper from "@/ui/components/wrapper";
// import InfiniteProductList from "../../../../ui/components/InfiniteProductList";
import InfiniteProducts from "@/ui/components/service/InfiniteProducts";

type ChangeProductModalProps = {
    setOpen: (open: number) => void;
    isDestroyHistoty: (isDestroy: boolean) => void;
    channel: string;
    exportRelativeDesignToJson?: () => Promise<object>;
    fromDevice: 1 | 2; //1 for desktop, 2 for mobile
    typeDesign: 1 | 3;
};

export function ChangeProductModal({ setOpen, isDestroyHistoty, channel, fromDevice, typeDesign }: ChangeProductModalProps) {
    useEffect(() => {
        isDestroyHistoty(false); // Gọi ngay khi popup được mount

        return () => {
            // không cần set lại nếu không nhấn ✕
        };
    }, []);


    const [changeProductpopupStatus, setChangeProductpopupStatus] = useState<number>(1);
    const [productSlug, setProductSlug] = useState<string>("");
    const onHandleChangeProductDesign = (productSlug: string) => {
        setChangeProductpopupStatus(2);
        setProductSlug(productSlug);
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
            <div
                className="bg-white rounded shadow-lg relative flex flex-col"
                style={{
                    width: fromDevice == 1 ? "80%" : "100%",  // 4/5 chiều rộng viewport
                    height: fromDevice == 1 ? "80%" : "100%", // chiều cao giới hạn
                }}
            >
                {/* Header */}
                <div className="bg-gray-200 px-6 py-1 rounded-t flex justify-between items-center flex-shrink-0">
                    <h3 className="flex-1 font-semibold text-gray-800 text-center">Change Product</h3>
                    <button
                        className="text-xl text-gray-600 hover:text-black"
                        onClick={() => {
                            localStorage.removeItem("designRelativeInfor");
                            localStorage.removeItem("changeProductFrom");
                            setOpen(0);
                            isDestroyHistoty(true);
                        }}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {(changeProductpopupStatus == 1) && (
                        <div className="p-6">
                            <Wrapper>
                                <InfiniteProducts
                                    channel={channel}
                                    first={ProductsPerPage}
                                    onHandleChangeProductDesign={onHandleChangeProductDesign}
                                />
                            </Wrapper>
                        </div>
                    )}
                    {(changeProductpopupStatus == 2) && (
                        <div className="p-6">
                            <Wrapper>
                                <ProductDetail params={{ channel: channel, slug: productSlug, fromDesign: true, typeDesign: typeDesign }} />
                            </Wrapper>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
