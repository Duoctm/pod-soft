/* eslint-disable import/no-default-export */

import Link from "next/link";

import React from "react";

const ShopNow = ({ channel }: { channel: string }) => {
    return (
        <Link
            href={`/${channel}/products`}
            className="rounded-full bg-[#F58B71] w-full text-center max-w-xl px-4  py-3  text-xl md:text-2xl 2xl:text-[30px] font-semibold text-[#273347] transition-colors duration-300 hover:bg-[#e06a5b]"
        >
            BUILD YOUR PROJECTS AND QUOTES NOW!
        </Link>
    );
};

export default ShopNow;
