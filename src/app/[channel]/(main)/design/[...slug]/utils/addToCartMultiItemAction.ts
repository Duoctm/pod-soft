"use server";
import { invariant } from "ts-invariant";
import { redirect } from "next/navigation";
import { checkoutLinesAddMultipleItems } from "./checkoutLinesAddMultipleItems";
import { type AddCartType, type PriceOfVariantDesign } from "./type";
import * as Checkout from "@/lib/checkout";
import { CurrentUserDocument, type MetadataInput, CheckoutDeleteLinesDocument, CheckoutFindDocument, PrintingTechnology } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
//import { VariantPrice } from "../component/type"

export type ErrorResponse = {
    error: number;
    type: string;
    messages: {
        field: string;
        message: string;
    }[];
};

export type CheckoutResponse<T> = {
    success: boolean;
    checkout?: T; // Replace 'any' with your actual checkout type
    error?: ErrorResponse;
};

export async function addCartMultiItem(
    channel: string,
    lines: AddCartType[],
    priceInfo: PriceOfVariantDesign[],
    // lines: CheckoutLineInput[],
    sericeIdS: string[],
    metadata: string | null,
    printTech: string
) {
    "use server";
    try {
        console.log('priceInfo', priceInfo);
        const { me: user } = await executeGraphQL(CurrentUserDocument, {
            cache: "no-cache",
        });
        if (!user) {
            redirect(`/${channel}/login`);
        }
        const checkout = await Checkout.findOrCreate({
            checkoutId: Checkout.getIdFromCookies(channel),
            channel: channel,

        });


        invariant(checkout, "This should never happen");

        Checkout.saveIdToCookie(channel, checkout.id);

        const newLines = lines.map((line) => {

            let printingInfoMetadata = null;
            let metadataOfItem = null;

            if (metadata && metadata != "null") {
                const metadataObject = JSON.parse(metadata) as any;
                metadataOfItem = metadataObject;
                metadataOfItem.variantId = line.variantId;
                metadataOfItem.productId = line.productId;
                printingInfoMetadata = createNewPrintingInfoMetadata(metadata, sericeIdS, printTech);
            }

            const pricingInfoMetadata = createNewPricingInfoMetadata(line.variantId, priceInfo);

            return {
                variantId: line.variantId,
                quantity: line.quantity,
                metadata: [{
                    key: "design",
                    value: JSON.stringify(metadataOfItem),
                },
                {
                    key: "printing_info",
                    value: JSON.stringify(printingInfoMetadata),
                },
                {
                    key: "pricing_info",
                    value: JSON.stringify(pricingInfoMetadata)
                }] as MetadataInput[],
            };
        })



        /*[{
                    key: "design",
                    value: metadata,
                },
                {
                    key: "printing_info",
                    value: printingInfoMetadata ?? "",
                }] */

        const updatedCheckout = await checkoutLinesAddMultipleItems({
            id: checkout.id,
            lines: newLines,
        });



        if (updatedCheckout?.errors?.length) {
            return {
                success: false,
                error: {
                    error: 2,
                    type: "Checkout",
                    messages: updatedCheckout.errors.map((error) => ({
                        field: error.field || "",
                        message: error.message ?? "",
                    })),
                }
            };
        }


        return {
            success: true,
            checkout: updatedCheckout
        };

    } catch (error) {
        return {
            success: false,
            error: {
                error: 3,
                type: "User",
                messages: [{ field: "user", message: (error as Error).message }]
            }
        };
    }
}


function createNewPrintingInfoMetadata(metadataDesign: string, serviceIds: string[], printTech: string) {
    const objectDesign = JSON.parse(metadataDesign) as any;
    const printFace: string[] = [];
    let printing_technology = "NONE"
    if (objectDesign) {
        for (const item of objectDesign.designs) {
            if (item.designs.length > 0) {
                printFace.push(item.face_code);
            }
        }
        if (printFace.length > 0) {
            if (printTech == PrintingTechnology.Silk) {
                printing_technology = PrintingTechnology.Silk;
            }
            else {
                printing_technology = PrintingTechnology.Dtg;
            }
        }
    }
    return [{
        print_side: "ALL",
        printing_technology: printing_technology,
        additional_service_ids: serviceIds
    }];
};

function createNewPricingInfoMetadata(variantId: string, priceInfo: PriceOfVariantDesign[]) {
    for (const item of priceInfo) {
        if (item.variantId == variantId) {
            return {
                member_price: item.memberPrice,
                retail_price: item.retail_price,
                discount_percentage: item.discount_percentage,
                currency: item.currency,
                has_discount: item.has_discount,
                color: item.color,
                quantity: item.quantity
            }
        }
    }
    return null;
};

export async function UpdateDesignMultiItem(
    variantIdOrigin: string,
    channel: string,
    lines: AddCartType[],
    priceInfo: PriceOfVariantDesign[],
    //lines: CheckoutLineInput[],
    sericeIdS: string[],
    metadata: string | null,
    printTech: string
) {
    const variantIds = lines.map(line => line.variantId);
    const checkoutId = Checkout.getIdFromCookies(channel);
    const { checkout } = checkoutId
        ? await executeGraphQL(CheckoutFindDocument, {
            variables: {
                id: checkoutId,
            },
            cache: "no-cache",
        })
        : { checkout: null };
    const checkoutLineIds = [];
    if (checkout?.lines) {
        for (const line of checkout?.lines) {
            if (variantIds.includes(line.variant.id) || variantIdOrigin == line.variant.id) {
                checkoutLineIds.push(line.id);
            }
        }
    }


    await executeGraphQL(CheckoutDeleteLinesDocument, {
        variables: {
            checkoutId: await Checkout.getIdFromCookies(channel),
            lineIds: checkoutLineIds,
        },
        cache: "no-cache",
    });
    const resultAddToCart = await addCartMultiItem(channel, lines, priceInfo, sericeIdS, metadata, printTech);

    return resultAddToCart.success;
    return true;
}