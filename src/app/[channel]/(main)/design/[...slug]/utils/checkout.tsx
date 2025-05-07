"use server";
//import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument, CurrentUserDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";
import { redirect } from "next/navigation";
import {updateCheckoutLineMetadata} from "./test"

export async function addItem(
    params: { slug: string; channel: string },
    selectedVariantID: string | null,
    quantity: number,
    metadata: string | null
  ) {
    "use server";
  
    try{
      const { me: user } = await executeGraphQL(CurrentUserDocument, {
        cache: "no-cache",
      });
      if (!user) {
        redirect(`/${params.channel}/login?redirect=/${params.channel}/products/${params.slug}`);
      }
    
      const checkout = await Checkout.findOrCreate({
        checkoutId: await Checkout.getIdFromCookies(params.channel),
        channel: params.channel,
      });
    
      invariant(checkout, "This should never happen");
    
      await Checkout.saveIdToCookie(params.channel, checkout.id);
    
      if (!selectedVariantID) {
        return { checkoutId: checkout.id }; // Trả về checkout id nếu không có selectedVariantID
      }
    
      // TODO: error handling
      const result = await executeGraphQL(CheckoutAddLineDocument, {
        variables: {
          id: checkout.id,
          productVariantId: decodeURIComponent(selectedVariantID),
          quantity: quantity,
        },
        cache: "no-cache",
      });
    
      // Kiểm tra lỗi trả về từ mutation
      if (result?.checkoutLinesAdd?.errors?.length) {
        console.error("Errors adding item to checkout:", result.checkoutLinesAdd.errors);
        throw new Error(result.checkoutLinesAdd.errors.map(e => e.message).join(", "));
      }
    
      // Lấy id của cart từ kết quả trả về
      const checkoutLineId = result?.checkoutLinesAdd?.checkout?.lines?.[0]?.id;
      if (metadata != null && metadata != ""){
        await updateCheckoutLineMetadata(checkoutLineId ?? "", [{
          key: "design",
          value: metadata,
        }]);
      }
    
      //revalidatePath("/cart");
      return true
    }
    catch(error){
     console.log(error);
    }
    return false;
  
    // Trả về checkoutId từ cart
    //return checkoutLineId; // Trả về checkoutId
  }
  


  export async function UpdateDesign(
    checkoutLineId: string,
    metadata: string
  ) {
    "use server";
  
   try{
    await updateCheckoutLineMetadata(checkoutLineId ?? "", [{
      key: "design",
      value: metadata,
    }]);
    return true;
   }
   catch(error){
    console.log(error);
   }
   return false;
  
  }