"use server";
//import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import { redirect } from "next/navigation";
import { updateCheckoutLineMetadata } from "./test"
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument, CurrentUserDocument, CheckoutDeleteLinesDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";
import { getUserServer } from "@/checkout/hooks/useUserServer";

export async function checkUser() {
  const check = await getUserServer();
  return check.status;
}

export async function addItem(
  params: { slug: string; channel: string },
  selectedVariantID: string | null,
  quantity: number,
  metadata: string | null,
) {
  "use server";

  try {
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
    var checkoutLineId = "";
    if (result?.checkoutLinesAdd?.checkout?.lines != null) {
      for (const i of result?.checkoutLinesAdd?.checkout?.lines) {
        if (i.variant.id === selectedVariantID) {
          checkoutLineId = i.id;
          break;
        }
      }
    }

    //const checkoutLineId = result?.checkoutLinesAdd?.checkout?.lines?.[0]?.id;
    if (metadata != null && metadata != "") {
      await updateCheckoutLineMetadata(checkoutLineId ?? "", [{
        key: "design",
        value: metadata,
      }]);
    }

    //revalidatePath("/cart");
    return true
  }
  catch (error) {
    console.log(error);
  }
  return false;

  // Trả về checkoutId từ cart
  //return checkoutLineId; // Trả về checkoutId
}


async function addItemToUpdateDesign(
  selectedVariantID: string,
  quantity: number,
  metadata: string | null,
  //checkoutId?: string,
  channel: string
) {
  "use server";

  try {

    // TODO: error handling
    console.log('sdahlkihujhSDHKSdfh', selectedVariantID);
    const result = await executeGraphQL(CheckoutAddLineDocument, {
      variables: {
        id: await Checkout.getIdFromCookies(channel),
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
    var checkoutLineId = "";
    if (result?.checkoutLinesAdd?.checkout?.lines != null) {
      for (const i of result?.checkoutLinesAdd?.checkout?.lines) {
        if (i.variant.id === selectedVariantID) {
          checkoutLineId = i.id;
          break;
        }
      }
    }

    if (metadata != null && metadata != "") {
      await updateCheckoutLineMetadata(checkoutLineId, [{
        key: "design",
        value: metadata,
      }]);
    }

    //await Checkout.saveIdToCookie(channel, checkoutId);
    return true
  }
  catch (error) {
    console.log(error);
  }
  return false;

  // Trả về checkoutId từ cart
  //return checkoutLineId; // Trả về checkoutId
}



export async function UpdateDesign(
  checkoutLineIdParam: string,
  metadata: string,
  checkoutId: string,
  deferenceVariant?: boolean, // Thêm tham số sameVariant để xác định có cùng variant hay không
  newVarianId?: string,
  channel?: string,
) {
  "use server";

  try {
    let checkoutLineId = checkoutLineIdParam;
    let quantity = 1;
    if (deferenceVariant && newVarianId && channel) {
      const result = await executeGraphQL(CheckoutDeleteLinesDocument, {
        variables: {
          checkoutId: await Checkout.getIdFromCookies(channel),
          lineIds: [checkoutLineIdParam],
        },
        cache: "no-cache",
      });
      for (const i of result?.checkoutLinesDelete?.checkout?.lines ?? []) {
        if (i.id == checkoutLineIdParam) {
          quantity = i.quantity;
          break;
        }
      }
      console.log("hahahahahhaha", newVarianId);

      await addItemToUpdateDesign(newVarianId, quantity, metadata, channel);

      await Checkout.saveIdToCookie(channel, checkoutId);



    }
    else {
      await updateCheckoutLineMetadata(checkoutLineId ?? "", [{
        key: "design",
        value: metadata,
      }]);
    }
    return true;
  }
  catch (error) {
    console.log(error);
  }
  return false;

}