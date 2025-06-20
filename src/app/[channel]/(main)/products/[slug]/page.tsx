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
        <ProductDetailComponent
            params={params}
        />
    );
};

export default ProductDetail;