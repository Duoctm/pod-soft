'use client'
import ProductDetailComponent from "./productDetail"

interface PageProps {
    params: {
        slug: string;
        channel: string;
    };
}

const ProductDetail: React.FC<PageProps> = ({ params }) => {
    return (
        <div className="bg-[#fafafa]">
            <ProductDetailComponent
                params={params}
            />
        </div>
    );
};

export default ProductDetail;