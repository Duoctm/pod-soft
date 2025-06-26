/* eslint-disable import/no-default-export */

import Link from "next/link";

import React from "react";

const ShopNow = ({ channel }: { channel: string }) => {
    return (
        <Link
            href={`/${channel}/products`}
            className="rounded-full bg-[#F58B71] px-6  py-3  text-2xl 2xl:text-[30px] font-bold text-[#273347] transition-colors duration-300 hover:bg-[#e06a5b]"
        >
            Shop Now
        </Link>
    );
};

export default ShopNow;
