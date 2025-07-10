'use client'

import { ProductDetail } from "./productDetailRefactored";

interface PageProps {
    params: {
        slug: string;
        channel: string;
    };
}

const ProductDetailPage: React.FC<PageProps> = ({ params }) => {
    return (
        <ProductDetail
            params={params}
        />
    );
};

export default ProductDetailPage;