"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from 'lucide-react';
import { getAdditionalService, getPrintingPriceRules } from "../utils/action";
import { fetchRawProductDetail } from "../utils/getProductDetailForDesign";
import { getCheckoutList } from "../../../cart/actions"
import { type AddCartType, type PriceOfVariantDesign } from "../utils/type"
import { type Service, type VariantPrice, type VariantSelect, type VariantPriceDropdown } from "./type";
import { PrintingTechnology, PrintSide } from "@/gql/graphql";

interface PopupProps {
    productId: string,
    channel: string,
    images: Record<string, string>; // mã -> base64
    variantId: string;
    variantUpdateId: string;
    printTech: PrintingTechnology;
    quantity: number;
    is_update?: boolean | null;
    is_add_to_cart?: boolean | null;
    serviceIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    priceOfVariantDesigns: React.Dispatch<React.SetStateAction<Set<PriceOfVariantDesign>>>;
    variantIds: React.Dispatch<React.SetStateAction<Set<AddCartType>>>;
    onClose: () => void;
    handlerCheckout: (() => void) | null;
    setPrintTechFromParent: React.Dispatch<React.SetStateAction<PrintingTechnology>>;

}

const AdditionalServicePopup: React.FC<PopupProps> = ({
    productId,
    channel,
    images,
    variantId,
    variantUpdateId,
    printTech,
    quantity,
    is_update,
    is_add_to_cart,
    serviceIds,
    priceOfVariantDesigns,
    variantIds,
    onClose,
    handlerCheckout,
    setPrintTechFromParent
}) => {
    const [step, setStep] = useState<"selectVariants" | "priceSummary">("selectVariants");
    //console.log(images);

    const extractNumericId = (globalId: string): string => {
        try {
            const decoded = atob(globalId);
            const parts = decoded.split(":");
            return parts[1];
        } catch (e) {
            console.error("Invalid ID:", e);
            return "";
        }
    };

    console.log(images);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set()); // danh sach service se duoc chon
    const [blankShirtPrice, setBlankShirtPrice] = useState<number>(0);
    const [printingPrice, setPrintingPrice] = useState<number>(0);
    const [totalUnitTotalPrice, setTotalUnitTotalPrice] = useState<number>(0);
    const [totalSaleUnitTotalPrice, setTotalSaleUnitTotalPrice] = useState<number>(0);

    const [listVariantIds, setListVariantIds] = useState<VariantPrice[]>([]); //danh sach tat ca variant
    const [selectVatriantIds, setSelectVatriantIds] = useState<VariantPrice[]>([]); //danh sach select
    const [listVariantShowSelects, setListVariantShowSelects] = useState<VariantSelect[]>([]); // danh sach duoc chon se duoc show len
    const [variantsDropdown, setVariantsDropdown] = useState<VariantPriceDropdown[]>([]); // du lieu dropdown xuong
    const [priceOfVariantDesign, setPriceOfVariantDesign] = useState<PriceOfVariantDesign[]>([]);

    const [printTechChild, setPrintTech] = useState<PrintingTechnology>(printTech);

    const printTechChildRef = useRef<PrintingTechnology>(printTech);
    useEffect(() => {
        printTechChildRef.current = printTechChild;

    }, [printTechChild]);

    const [selectedVariants, setSelectedVariants] = useState<VariantPrice[]>([{
        variantId: variantId,
        quanlity: quantity
    }]);


    const [isSpinner, setSpinner] = useState<boolean>(false);

    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (variantId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(variantId)) {
                newSet.delete(variantId);
            } else {
                newSet.add(variantId);
            }
            return newSet;
        });
    };

    // Toggle chọn variant
    const toggleVariant = (variantId: string) => {
        setSelectedVariants((prev) => {
            const exists = prev.find(v => v.variantId === variantId);

            if (exists) {
                // Bỏ chọn: loại bỏ variant khỏi selectedVariants
                return prev.filter(v => v.variantId !== variantId);
            } else {
                // Thêm chọn: tìm variant trong listVariantIds rồi thêm vào selectedVariants
                const variantToAdd = listVariantIds.find(v => v.variantId === variantId);
                if (variantToAdd) {
                    return [...prev, variantToAdd];
                }
                // Nếu không tìm thấy variantId trong listVariantIds thì giữ nguyên prev
                return prev;
            }
        });
    };



    const handleServiceToggle = (id: string) => {
        setSelectedServices((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    useEffect(() => {
        serviceIds(selectedServices);
    }, [selectedServices]);

    const totalServicePrice = services
        .filter((s) => selectedServices.has(s.id))
        .reduce((sum, s) => sum + s.price, 0);

    const getImageAndName = (id: string) => {
        const result: { image: string; name: string } = {
            image: "",
            name: ""
        };
        for (const i of listVariantShowSelects) {
            if (i.variantId == id) {
                result.image = i.image;
                result.name = i.name
                break;
            }
        }
        return result;
    }

    const getProductDetailOfDesign = async () => {
        let listProductDetail: any[] = [];
        const listProductDetailRaw = localStorage.getItem('listProductDetail');
        if (listProductDetailRaw) {
            listProductDetail = JSON.parse(listProductDetailRaw) as any[];
        }
        else {
            const result = await fetchRawProductDetail(productId, channel);
            if (
                typeof result === "object" &&
                result !== null &&
                "product" in result &&
                Array.isArray((result as any).product?.variants)
            ) {
                const product = result.product as {
                    variants: {
                        id: string;
                        name: string;
                        media?: { url: string }[];
                        product: { id: string };
                    }[];
                };

                listProductDetail = product.variants;
            }
        }
        return listProductDetail;
    }

    const caculatorPriceOfListVariant = async () => {
        const variantsDropdownTemp: VariantPriceDropdown[] = [];
        let totalBlankPrice = 0;
        let totalPrintPrice = 0;
        let totalUnitTotalPrice = 0;
        let totalSaleUnitTotalPrice = 0;
        for (const item of selectVatriantIds) {
            const numberVarianId = extractNumericId(item.variantId);

            const resultPricePrintingRules: any[] = []

            const printSides = [PrintSide.Front, PrintSide.Back, PrintSide.None];

            for (const p of printSides) {
                const data = await getPrintingPriceRules([
                    printTechChildRef.current,
                    PrintingTechnology.None,
                ], channel, p, Number(numberVarianId), undefined);
                if (data && Array.isArray(data)) {
                    resultPricePrintingRules.push(...data);
                }
            }

            let blankPrice = 0;
            let printPrice = 0;
            let unitTotalPrice = 0;
            const quantity = item.quanlity;
            let blankSalePrice = 0;
            let printSalePrice = 0;
            let saleUnitTotalPrice = 0;

            if (resultPricePrintingRules) {
                for (const rule of resultPricePrintingRules) {
                    const condition = rule.node.condition;
                    if (condition && condition.minQuantity !== null &&
                        condition.maxQuantity !== null &&
                        condition.minQuantity &&
                        condition.maxQuantity &&
                        condition.printingTechnology !== null &&
                        quantity >= condition.minQuantity &&
                        quantity <= condition.maxQuantity
                    ) {
                        if (rule.node.usedForCalculation == false) {
                            if (condition.printingTechnology === PrintingTechnology.None && rule.node.price && rule.node.printSide == PrintSide.None) {
                                blankPrice = rule.node.price;
                            }
                        }
                        else {
                            if (
                                condition.printingTechnology === PrintingTechnology.None && rule.node.price && rule.node.printSide == PrintSide.None) {
                                blankSalePrice = rule.node.price;
                            }
                        }
                    }
                }

                let unitTotalPriceTemp = 0;
                let saleUnitTotalPriceTemp = 0;

                for (const rule of resultPricePrintingRules) {
                    const condition = rule.node.condition;
                    if (
                        condition &&
                        condition.minQuantity !== null &&
                        condition.maxQuantity !== null &&
                        condition.minQuantity &&
                        condition.maxQuantity &&
                        condition.printingTechnology !== null &&
                        quantity >= condition.minQuantity &&
                        quantity <= condition.maxQuantity
                    ) {
                        if (rule.node.usedForCalculation == false) {

                            if (condition.printingTechnology === printTechChildRef.current && rule.node.price && rule.node.printSide == PrintSide.Front) {
                                unitTotalPriceTemp += rule.node.price;
                            }

                            if (condition.printingTechnology === printTechChildRef.current && rule.node.price && rule.node.printSide == PrintSide.Back) {
                                unitTotalPriceTemp += rule.node.price;
                            }
                        }
                        else {
                            if (condition.printingTechnology === printTechChildRef.current && rule.node.price && rule.node.printSide == PrintSide.Front) {
                                saleUnitTotalPriceTemp += rule.node.price;
                            }
                            if (condition.printingTechnology === printTechChildRef.current && rule.node.price && rule.node.printSide == PrintSide.Back) {
                                saleUnitTotalPriceTemp += rule.node.price;
                            }
                        }
                    }
                }

                printSalePrice = saleUnitTotalPriceTemp - blankSalePrice;
                printPrice = unitTotalPriceTemp - blankPrice;
                saleUnitTotalPrice = saleUnitTotalPriceTemp;
                unitTotalPrice = unitTotalPriceTemp;
            }
            const nameImage = getImageAndName(item.variantId);

            variantsDropdownTemp.push({
                blankPrice: blankPrice,
                printingPrice: printPrice,
                variantId: item.variantId,
                imageBase64: nameImage.image,
                name: nameImage.name,
                quantity: item.quanlity,
                salePriceBlank: blankSalePrice,
                salePricePrinting: printSalePrice,
                unitTotalPrice: unitTotalPrice,
                saleUnitTotalPrice: saleUnitTotalPrice
            });

            totalBlankPrice += blankPrice * item.quanlity;
            totalPrintPrice += printPrice * item.quanlity;

            totalUnitTotalPrice += unitTotalPrice * item.quanlity;
            totalSaleUnitTotalPrice += saleUnitTotalPrice * item.quanlity;

        }

        /*XU LY TRUONG HOP BLANK PRICE BANG 0 */
        for (const item of variantsDropdownTemp) {
            if (item.blankPrice == 0) {
                const listProductDetail = await getProductDetailOfDesign();
                for (const variant of listProductDetail) {
                    if (variant.id == item.variantId) {
                        item.blankPrice = variant.pricing.price.gross.amount;
                        item.printingPrice = item.unitTotalPrice - variant.pricing.price.gross.amount;
                        break;
                    }
                }
            }
        }

        /*xu ly gan gia cho pricing trong metadata*/
        const priceOfVariantDesignTeamp = priceOfVariantDesign;
        for (const item of variantsDropdownTemp) {
            for (const variantPrice of priceOfVariantDesign) {
                if (item.variantId == variantPrice.variantId) {
                    variantPrice.memberPrice = item.saleUnitTotalPrice;
                    variantPrice.retail_price = item.unitTotalPrice;
                    variantPrice.discount_percentage = Math.floor(((item.unitTotalPrice - item.saleUnitTotalPrice) / item.unitTotalPrice) * 100);
                    variantPrice.has_discount = variantPrice.discount_percentage > 0 ? true : false;
                }
            }
        }

        setPriceOfVariantDesign(priceOfVariantDesignTeamp);
        priceOfVariantDesigns(new Set(priceOfVariantDesignTeamp));


        setBlankShirtPrice(totalBlankPrice);
        setPrintingPrice(totalPrintPrice);
        setVariantsDropdown(variantsDropdownTemp);

        setTotalUnitTotalPrice(totalUnitTotalPrice);
        setTotalSaleUnitTotalPrice(totalSaleUnitTotalPrice);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                //if (is_add_to_cart) {
                if (step == "selectVariants") {
                    const fecthProductDetail = async () => {
                        if (is_add_to_cart) {
                            setSpinner(true);
                            const listVariantPrice: VariantPrice[] = [];
                            const listVariantSelect: string[] = [];
                            const jsonServices = localStorage.getItem("services");
                            if (jsonServices) {
                                const parsed = JSON.parse(jsonServices);
                                const parsedArray = parsed as any[]; // Ép kiểu đơn giản thành mảng bất kỳ
                                for (const i of parsedArray) {
                                    listVariantSelect.push(i.variantId)
                                    listVariantPrice.push({
                                        quanlity: i.quantity,
                                        variantId: i.variantId,
                                        //productId: i.product.id
                                    });
                                }
                                setListVariantIds(listVariantPrice);
                            }
                            if (variantId != variantUpdateId) {
                                for (const i in listVariantSelect) {
                                    if (listVariantSelect[i] == variantId) {

                                        listVariantSelect[i] = variantUpdateId;
                                        break;
                                    }
                                }
                                for (const i in selectedVariants) {
                                    if (selectedVariants[i].variantId == variantId) {

                                        selectedVariants[i].variantId = variantUpdateId;
                                        break;
                                    }
                                }
                            }
                            const variantShowSelect: VariantSelect[] = [];

                            let result = null;

                            const rawResult = localStorage.getItem('productDetailDesign');
                            if (rawResult) {
                                result = JSON.parse(rawResult);
                            }
                            else {
                                result = await fetchRawProductDetail(productId, channel);
                            }

                            if (
                                typeof result === "object" &&
                                result !== null &&
                                "product" in result &&
                                Array.isArray((result as any).product?.variants)
                            ) {
                                const product = result.product as {
                                    variants: {
                                        id: string;
                                        name: string;
                                        media?: { url: string }[];
                                        product: { id: string };
                                    }[];
                                };

                                for (const variant of product.variants) {
                                    if (listVariantSelect.includes(variant.id)) {
                                        variantShowSelect.push({
                                            productId: variant.product.id,
                                            variantId: variant.id,
                                            image: variant.media?.[0]?.url ?? "",
                                            name: variant.name,
                                            isDefault: variantId === variant.id,
                                        });
                                    }
                                }
                                localStorage.setItem('listProductDetail', JSON.stringify(product.variants));
                            }
                            setListVariantShowSelects(variantShowSelect);
                            setSpinner(false);
                        }
                        else {
                            setSpinner(true);
                            const listVariantPrice: VariantPrice[] = [];
                            const listVariantSelect = [] as { variantId: string; productId: string }[];
                            let cartData = null;
                            const cartDataRaw = localStorage.getItem("cartUpdateDesign");
                            if (cartDataRaw) {
                                cartData = JSON.parse(cartDataRaw);
                            }
                            else {
                                cartData = await getCheckoutList(channel);
                            }
                            const cartDataExpand = cartData as any;
                            for (const line of cartDataExpand.checkout.lines) {
                                listVariantSelect.push({
                                    variantId: line.variant.id,
                                    productId: line.variant.product.id,
                                })
                                listVariantPrice.push({
                                    quanlity: line.quantity,
                                    variantId: line.variant.id,
                                    //productId: line.product.id
                                });
                            }
                            setListVariantIds(listVariantPrice);

                            if (variantId != variantUpdateId) {
                                for (const i in listVariantSelect) {
                                    if (listVariantSelect[i].variantId == variantId) {
                                        listVariantSelect[i].variantId = variantUpdateId;
                                        break;
                                    }
                                }
                                for (const i in selectedVariants) {
                                    if (selectedVariants[i].variantId == variantId) {

                                        selectedVariants[i].variantId = variantUpdateId;
                                        break;
                                    }
                                }
                            }

                            const listVariantSelectId = listVariantSelect.map(item => item.variantId);

                            const productVariantItems: any[] = [];
                            const variantShowSelect: VariantSelect[] = [];
                            // const result = await fetchRawProductDetail(listVariantSelect[1].productId, channel);
                            // console.log('reeeeeeeeee', result.product?.variants);

                            for (const i of listVariantSelect) {
                                let isInProductVariantItems = false
                                for (const variant of productVariantItems) {
                                    if (variant.id == i.variantId) {

                                        if (!variantShowSelect.some(item => item.variantId === variant.id)) {
                                            variantShowSelect.push({
                                                productId: variant.product.id,
                                                variantId: variant.id,
                                                image: variant.media?.[0]?.url ?? "",
                                                name: variant.name,
                                                isDefault: variantId === variant.id
                                            });
                                        }

                                        isInProductVariantItems = true;
                                        break;
                                    }
                                }
                                if (isInProductVariantItems == false) {
                                    const result = await fetchRawProductDetail(i.productId, channel);
                                    if (result) {
                                        productVariantItems.push(...(result.product?.variants ?? []));
                                        if (result.product?.variants) {
                                            for (const variant of result.product?.variants) {
                                                if (listVariantSelectId.includes(variant.id)) {
                                                    if (!variantShowSelect.some(item => item.variantId === variant.id)) {
                                                        variantShowSelect.push({
                                                            productId: variant.product.id,
                                                            variantId: variant.id,
                                                            image: variant.media?.[0]?.url ?? "",
                                                            name: variant.name,
                                                            isDefault: variantId === variant.id
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }


                            localStorage.setItem('listProductDetail', JSON.stringify(productVariantItems));

                            setListVariantShowSelects(variantShowSelect);
                            setSpinner(false);
                        }
                    }
                    fecthProductDetail();
                }
                else if (step == "priceSummary") {
                    caculatorPriceOfListVariant();
                }
                const resultAdditionalService: any[] = [];
                let after: string | null = null;
                let hasNextPage: boolean = true;
                while (hasNextPage) {
                    const data = await getAdditionalService(channel, 1000, after);

                    resultAdditionalService.push(...(data.publicPrintingAdditionalServices?.edges ?? []));

                    hasNextPage = data.publicPrintingAdditionalServices?.pageInfo.hasNextPage || false;
                    after = data.publicPrintingAdditionalServices?.pageInfo.endCursor || null;
                }

                if (resultAdditionalService) {
                    const service: Service[] = resultAdditionalService.map((i: any) => ({
                        name: i.node.name ?? "",
                        price: i.node.price ?? 0,
                        id: extractNumericId(i.node.id ?? ""),
                    }));
                    setServices(service);
                }

                const jsonServices = localStorage.getItem("services");
                if (jsonServices) {
                    const parsed = JSON.parse(jsonServices);
                    if (is_update) {
                        if (typeof parsed === "string") {
                            const data = JSON.parse(parsed) as {
                                additional_service_ids?: (string | number)[];
                            };
                            const ids = Array.isArray(data.additional_service_ids)
                                ? data.additional_service_ids
                                : [];
                            setSelectedServices(new Set(ids.map((id: number | string) => id.toString())));
                        }
                    } else {
                        const parsedArray = parsed as any[]; // Ép kiểu đơn giản thành mảng bất kỳ
                        for (const i of parsedArray) {
                            if (i.variantId === variantId) {
                                for (const j of i.metadata) {
                                    if (j.key === "printing_info") {
                                        const ids = (JSON.parse(j.value as string) as any)[0]
                                            .additional_service_ids;
                                        setSelectedServices(new Set(ids.map((id: number | string) => id.toString())));
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi khi gọi API:", err);
            }
        };

        fetchData();
    }, [is_add_to_cart, step]);

    return (
        <>
            <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
                <div className={`${step === "selectVariants"
                    ? "w-full sm:w-[500px] md:w-[600px] h-auto sm:h-auto"
                    : "w-full sm:w-[90vw] md:w-[80vw] h-full sm:h-[90vh]"
                    } bg-white rounded-none sm:rounded-xl shadow-lg relative flex flex-col overflow-hidden`}>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-black text-3xl sm:text-4xl leading-none z-10"
                        aria-label="Close popup"
                    >
                        &times;
                    </button>

                    {/* Bước chọn variant */}
                    {step === "selectVariants" && (
                        <div className="p-6 flex flex-col h-full">
                            <h2 className="text-xl font-semibold mb-4">Copy the design onto other variants?</h2>
                            <div className="flex-1 overflow-y-auto">
                                {listVariantShowSelects.map((variant) => (
                                    <label
                                        key={variant.variantId}
                                        className="flex items-center gap-4 p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        <img
                                            src={variant.image}
                                            alt={variant.name}
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                        <span className="flex-1 text-base">{variant.name}</span>
                                        <input
                                            type="checkbox"
                                            checked={selectedVariants.some((v) => v.variantId === variant.variantId)}
                                            onChange={() => toggleVariant(variant.variantId)} // truyền cả object
                                            className="accent-[#783c54]"
                                        />
                                    </label>
                                ))}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-1">
                                        Printing Technology
                                    </label>
                                    <select
                                        value={printTechChild}
                                        onChange={(e) => {
                                            //alert(e.target.value);
                                            setPrintTechFromParent(e.target.value as PrintingTechnology)
                                            setPrintTech(e.target.value as PrintingTechnology);
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="" disabled>
                                            Select a printing technology
                                        </option>
                                        <option value={PrintingTechnology.Dtg}>DTG</option>
                                        <option value={PrintingTechnology.Silk}>SILK</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={async () => {
                                        setSelectVatriantIds(selectedVariants);

                                        const variantIdSelects: AddCartType[] = [];
                                        const priceOfServiceTemp: PriceOfVariantDesign[] = [];// /priceOfServices
                                        const listProductDetail = await getProductDetailOfDesign();

                                        for (const sv of selectedVariants) {
                                            let color = "";
                                            let currency = "";
                                            for (const variant of listProductDetail) {
                                                if (variant.id == sv.variantId) {
                                                    for (const atributeItem of variant.attributes) {
                                                        if (atributeItem.attribute.slug == "color") {
                                                            color = atributeItem.values[0].name;
                                                            currency = variant.pricing.price.gross.currency;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            for (const ls of listVariantShowSelects) {
                                                if (ls.variantId == sv.variantId) {
                                                    variantIdSelects.push({
                                                        productId: ls.productId,
                                                        quantity: sv.quanlity,
                                                        variantId: sv.variantId
                                                    });
                                                    priceOfServiceTemp.push({
                                                        variantId: ls.variantId,
                                                        color: color,
                                                        currency: currency,
                                                        discount_percentage: 0,
                                                        has_discount: false,
                                                        memberPrice: 0,
                                                        quantity: sv.quanlity,
                                                        retail_price: 0
                                                    });
                                                }
                                            }
                                        }

                                        variantIds(new Set(variantIdSelects));

                                        priceOfVariantDesigns(new Set(priceOfServiceTemp));
                                        setPriceOfVariantDesign(priceOfServiceTemp);


                                        if (printTechChildRef.current == PrintingTechnology.Silk) {
                                            for (const item of selectedVariants) {
                                                const printSides = [PrintSide.Front, PrintSide.Back];
                                                const retailPrice = 0;
                                                let memberPrice = 0;

                                                for (const p of printSides) {

                                                    const data = await getPrintingPriceRules([
                                                        PrintingTechnology.Silk,
                                                    ], channel, p, undefined, item.quanlity);

                                                    console.log('quantity', item.quanlity, data);


                                                    if (data && Array.isArray(data)) {

                                                        for (const rule of data) {
                                                            const condition = rule.node.condition;
                                                            if (condition && condition.minQuantity !== null &&
                                                                condition.maxQuantity !== null &&
                                                                condition.minQuantity &&
                                                                condition.maxQuantity &&
                                                                item.quanlity >= condition.minQuantity &&
                                                                item.quanlity <= condition.maxQuantity
                                                            ) {

                                                                if (rule.node.usedForCalculation == true && rule.node.minColors == 1 && rule.node.maxColors == 1) {
                                                                    memberPrice += rule.node.price || 0;
                                                                    console.log('memberPrice', memberPrice, rule.node.price, rule.node.usedForCalculation, rule.node.minColors, rule.node.maxColors);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                for (const ps of priceOfServiceTemp) {
                                                    if (ps.variantId == item.variantId) {
                                                        ps.retail_price = retailPrice;
                                                        ps.memberPrice = parseFloat(memberPrice.toFixed(2));
                                                        ps.discount_percentage = Math.floor(((retailPrice - memberPrice) / retailPrice) * 100);
                                                        ps.has_discount = ps.discount_percentage > 0 ? true : false;
                                                        break;
                                                    }
                                                }


                                            }
                                            console.log('priceOfServiceTemp', priceOfServiceTemp);
                                            priceOfVariantDesigns(new Set(priceOfServiceTemp));
                                            setPriceOfVariantDesign(priceOfServiceTemp);

                                            if (typeof handlerCheckout === "function") {
                                                handlerCheckout();
                                            }
                                        }
                                        else {
                                            setStep("priceSummary");
                                        }
                                    }}
                                    disabled={selectedVariants.length === 0}
                                    className={`px-4 py-2 rounded-md text-white text-center ${selectedVariants.length === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#2c3c50] hover:bg-[#2c3c50]"
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bước tính giá */}
                    {step === "priceSummary" && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
                                <div className="mb-4">
                                    <div className="mt-2 w-full border rounded-md bg-white shadow-sm overflow-x-auto">
                                        <table className="min-w-full text-left border border-gray-200 text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="px-2 sm:px-4 py-2 border-b">Image</th>
                                                    <th className="px-2 sm:px-4 py-2 border-b">Variant Name</th>
                                                    <th className="px-2 sm:px-4 py-2 border-b text-right">Blank Price</th>
                                                    <th className="px-2 sm:px-4 py-2 border-b text-right">Printing Price</th>
                                                    <th className="px-2 sm:px-4 py-2 border-b text-right">Unit Total Price</th>
                                                    <th className="py-2 border-b text-right"></th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {variantsDropdown.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500 italic">
                                                            No variants selected.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    variantsDropdown.map((variant) => {
                                                        // const totalPrice = variant.blankPrice + variant.printingPrice;
                                                        // const salePriceTotalPrice = variant.salePriceBlank + variant.salePricePrinting;
                                                        const isExpanded = expandedRows.has(variant.variantId);

                                                        return (
                                                            <React.Fragment key={variant.variantId}>
                                                                <tr
                                                                    className="hover:bg-gray-50 cursor-pointer"
                                                                    onClick={() => toggleRow(variant.variantId)}
                                                                >
                                                                    <td className="px-2 sm:px-4 py-2 border-b">
                                                                        <img
                                                                            src={variant.imageBase64}
                                                                            alt={variant.name}
                                                                            className="w-12 h-12 object-contain rounded"
                                                                        />
                                                                    </td>
                                                                    <td className="px-2 sm:px-4 py-2 border-b">{variant.name}</td>

                                                                    {/* Blank Price */}
                                                                    <td className="px-2 sm:px-4 py-2 border-b">
                                                                        {(variant.blankPrice != 0 && variant.blankPrice > variant.salePriceBlank) ? (
                                                                            <>
                                                                                <div className="flex items-baseline gap-x-2 justify-end">

                                                                                    <span className="line-through text-gray-600">${variant.blankPrice.toFixed(2)}</span>
                                                                                    <span className="text-lg font-bold text-gray-900 leading-none">
                                                                                        ${variant.salePriceBlank.toFixed(2)}
                                                                                    </span>
                                                                                </div>

                                                                            </>
                                                                        )
                                                                            :
                                                                            <>
                                                                                <div className="flex items-baseline gap-x-2 justify-end">
                                                                                    <span className="text-lg font-bold text-gray-900 leading-none">
                                                                                        ${variant.salePriceBlank.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        }

                                                                    </td>

                                                                    {/* Printing Price */}
                                                                    <td className="px-2 sm:px-4 py-2 border-b">
                                                                        {(variant.blankPrice != 0 && variant.blankPrice > variant.salePriceBlank) ? (
                                                                            <>
                                                                                <div className="flex items-baseline gap-x-2 justify-end">

                                                                                    <span className="line-through text-gray-600">${variant.printingPrice.toFixed(2)}</span>
                                                                                    <span className="text-lg font-bold text-gray-900 leading-none">
                                                                                        ${variant.salePricePrinting.toFixed(2)}
                                                                                    </span>
                                                                                </div>

                                                                            </>
                                                                        )
                                                                            :
                                                                            <>
                                                                                <div className="flex items-baseline gap-x-2 justify-end">
                                                                                    <span className="text-lg font-bold text-gray-900 leading-none">
                                                                                        ${variant.salePricePrinting.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        }

                                                                    </td>

                                                                    {/* Total Price */}
                                                                    <td className="px-2 sm:px-4 py-2 border-b text-[#783c54]">
                                                                        <div className="flex items-baseline gap-x-2 justify-end">

                                                                            <span className="line-through">${variant.unitTotalPrice.toFixed(2)}</span>
                                                                            <span className="text-lg font-bold leading-none">
                                                                                ${variant.saleUnitTotalPrice.toFixed(2)}
                                                                            </span>
                                                                        </div>

                                                                    </td>

                                                                    <td className="py-2 border-b text-right">
                                                                        <ChevronDown />
                                                                    </td>
                                                                </tr>

                                                                {isExpanded && (
                                                                    <tr className="bg-gray-50">
                                                                        <td colSpan={6} className="px-4 py-3 border-b">
                                                                            <div className="space-y-2 text-sm">
                                                                                <div className="flex justify-between">
                                                                                    <strong>Blank Price:</strong>
                                                                                    <span>${variant.blankPrice.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <strong>Printing Price:</strong>
                                                                                    <span>${variant.printingPrice.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <strong>Unit Total Price:</strong>
                                                                                    <span className="text-[#783c54]">
                                                                                        ${variant.unitTotalPrice.toLocaleString()}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex justify-between text-sm">
                                                                                    <strong>Discount:</strong>
                                                                                    <span >
                                                                                        -${(variant.unitTotalPrice - variant.saleUnitTotalPrice).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between text-sm">
                                                                                    <strong>Price After Discount:</strong>
                                                                                    <span className="font-medium text-gray-900">
                                                                                        ${variant.saleUnitTotalPrice.toLocaleString()}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex justify-between">
                                                                                    <strong>Quantity:</strong>
                                                                                    <span>x{variant.quantity}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <strong>Total Item Price:</strong>
                                                                                    <span className="text-[#783c54] font-bold">
                                                                                        ${(variant.saleUnitTotalPrice * variant.quantity).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                                }
                                                            </React.Fragment>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>

                                    </div>
                                    {/* )} */}

                                </div>



                                {/* Pricing summary */}
                                <div className="bg-gray-50 rounded-md p-3 sm:p-4 shadow-inner flex flex-col justify-center space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span><strong>Total Blank Shirt Price:</strong></span>
                                        <span className="text-base sm:text-lg font-semibold text-black">
                                            ${blankShirtPrice.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span><strong>Total Printing Technology Price:</strong></span>
                                        <span className="text-base sm:text-lg font-semibold text-black">
                                            ${printingPrice.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span><strong>Total Base Price:</strong></span>
                                        <span className="text-lg sm:text-xl font-bold text-[#783c54]">
                                            ${(blankShirtPrice + printingPrice).toLocaleString()}
                                        </span>
                                    </div>
                                    {/* ✅ Tổng tiền được giảm */}
                                    <div className="flex justify-between text-sm">
                                        <span><strong>Total Discount:</strong></span>
                                        <span className="font-medium">
                                            -${(totalUnitTotalPrice - totalSaleUnitTotalPrice).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* ✅ Tổng giá sau khi giảm */}
                                    <div className="flex justify-between text-sm">
                                        <span><strong>Total After Discount:</strong></span>
                                        <span className="text-lg sm:text-xl font-bold text-[#783c54]">
                                            ${totalSaleUnitTotalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </div>


                                {/* Services table and summary */}
                                <div className="bg-white border rounded-md p-3 sm:p-4 flex flex-col md:flex-row gap-4">
                                    {/* Table */}
                                    <div className="w-full md:w-2/3 overflow-x-auto">
                                        <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded">
                                            <table className="min-w-full text-left text-sm">
                                                <thead className="sticky top-0 bg-gray-100 z-10">
                                                    <tr>
                                                        <th className="px-2 sm:px-4 py-2 border-b">Service Name</th>
                                                        <th className="px-2 sm:px-4 py-2 border-b text-right">Price</th>
                                                        <th className="px-2 sm:px-4 py-2 border-b text-center">Select</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {services.map((service, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-2 sm:px-4 py-2 border-b">{service.name}</td>
                                                            <td className="px-2 sm:px-4 py-2 border-b text-right">
                                                                ${service.price.toLocaleString()}
                                                            </td>
                                                            <td className="px-2 sm:px-4 py-2 border-b text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedServices.has(service.id)}
                                                                    onChange={() => handleServiceToggle(service.id)}
                                                                    className="accent-[#783c54]"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-3 text-right text-sm text-gray-600">
                                            Selected Services Total:&nbsp;
                                            <span className="text-base font-semibold text-[#783c54]">
                                                ${totalServicePrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col justify-center">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-600">Base Price (Shirt + Printing)</div>
                                                <div className="text-base sm:text-lg font-semibold text-black">
                                                    ${(totalSaleUnitTotalPrice).toLocaleString()}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-600">Selected Services Total</div>
                                                <div className="text-base sm:text-lg font-semibold text-black">
                                                    ${totalServicePrice.toLocaleString()}
                                                </div>
                                            </div>

                                            <hr className="my-2" />

                                            <div>
                                                <div className="text-sm text-gray-600">Subtotal</div>
                                                <div className="text-lg sm:text-xl font-bold text-[#783c54]">
                                                    ${((totalSaleUnitTotalPrice) + totalServicePrice).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Action buttons */}
                            <div className="p-3 sm:p-4 border-t flex justify-center gap-4 sm:gap-6 flex-wrap">
                                <button
                                    onClick={() => {
                                        setStep("selectVariants");
                                    }}
                                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => {
                                        if (typeof handlerCheckout === "function") {
                                            handlerCheckout();
                                        }
                                    }}
                                    className="px-4 py-2 rounded-md bg-[#2c3c50] text-white hover:bg-[#2c3c50]"
                                >
                                    Confirm
                                </button>
                            </div>
                        </>
                    )
                    }
                </div >
            </div >
            {isSpinner && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
            )
            }
        </>
    );
};

export { AdditionalServicePopup };
