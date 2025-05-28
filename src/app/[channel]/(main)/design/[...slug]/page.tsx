"use client";

import { useEffect, useState } from "react";
import DesignPage from "./component/DesignPage";
import { type DesignInfo } from "./utils/type";
import { useBreadcrumb } from "@/ui/components/BreadcrumbProvider";

interface PageProps {
  params: {
    slug: string[];
    channel: string;
  };
}

function Page({ params }: PageProps) {
  const { setBreadcrumb } = useBreadcrumb();
  setBreadcrumb("");
  const { slug = [] } = params;
  const type = Number(decodeURIComponent(slug[0]));
  const productId = decodeURIComponent(slug[1]);
  const colorId = decodeURIComponent(slug[2]);
  const variantId = decodeURIComponent(slug[3]);

  const [colorDataMap, setColorDataMap] = useState<DesignInfo | null>(null);



  useEffect(() => {
    if (type === 2) {
      const json = localStorage.getItem("designInfor");
      // setJsonDesign(json)
      // // console.log('component mount', json);
      // //const data = JSON.parse(json) as DesignInfo
      //     console.log(json)

      if (json) {
        try {
          const jsonObject = JSON.parse(json) as DesignInfo | null;
          // const map = new Map<string, object>(Object.entries(jsonObject));
          setColorDataMap(jsonObject)

        } catch (error) {
          console.error("Lỗi khi parse hoặc tạo Map từ localStorage:", error);
        }
      }
    }
  }, [type]);

  return (
    <>
      <DesignPage
        variantId={variantId}
        productId={productId}
        colorId={colorId}
        designInfor={colorDataMap}
        channel={params.channel}
        typeDesign={type}
      />



    </>
  );
}

export default Page;
