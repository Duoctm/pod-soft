"use client"
// import DesignPage from "./component/DesignPage";
//import json from "./test.json"
//import {DesignInfo} from "./utils/type"
interface PageProps {
  params: {
    slug: string[];
    channel: string;
  };
}

function Page({ params }: PageProps) {
  const { slug = [] } = params;
  console.log(slug)

  // const productId = decodeURIComponent(slug[0]);
  // const colorId = decodeURIComponent(slug[1]);
  //const colorDataMap = new Map<string, object>(Object.entries(json)) as DesignInfo;
  return (
    <div>
      Imcoming soon
    </div>

    // <DesignPage 
    //   productId={productId}
    //   colorId={colorId}
    //   designInfor={null} 
    // />
  )
}

export default Page;