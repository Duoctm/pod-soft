
export interface PrintDetail {
    print_side: string;
    printing_technology: string;
}


export interface PrintingInfo {
    value: string; // JSON string chứa mảng PrintDetail
}


export interface Service {
    id: string;
    name: string;
    price: number;
}

export interface Variant {
    id: string;
    name: string;
    image: string;
}

export interface VariantPrice {
    variantId: string;
    quanlity: number
}

export interface VariantSelect {
    productId: string;
    variantId: string;
    name: string;
    image: string;
    isDefault: boolean;
}

export interface VariantPriceDropdown {
    variantId: string;
    name: string;
    imageBase64: string;
    blankPrice: number;
    printingPrice: number;
    quantity: number;
    salePriceBlank: number;
    salePricePrinting: number;
    unitTotalPrice: number;
    saleUnitTotalPrice: number
}