/* eslint-disable import/no-default-export */
import React from 'react'
import { Dialog } from '@headlessui/react'
import { type PrintingPriceRuleCountableEdge } from '@/gql/graphql'
import { formatMoney } from '@/lib/utils'

type MarginPricePopupProps = {
    open: boolean
    onClose: () => void
    title: string,
    variantValues: {
        name: string
        size: string
    }[]
    listMarginPrice?: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[] | null
}

const MarginPricePopup: React.FC<MarginPricePopupProps> = ({ open, onClose, title, listMarginPrice, variantValues }) => {

    if (!listMarginPrice || listMarginPrice.length === 0) {
        return (
            <div className="text-xl font-semibold mb-4 capitalize">No Margin Price Available</div>
        )
    }

    // Group rules by printingTechnology
    const rules = listMarginPrice.map((item) => item.node);
    const groupedByTech: Record<string, typeof rules> = {};
    rules.forEach(rule => {
        const tech = rule.condition?.printingTechnology || 'UNKNOWN';
        if (!groupedByTech[tech]) groupedByTech[tech] = [];
        groupedByTech[tech].push(rule);
    });

    // Lấy unique printingTechnology
    const printingTechnologies = Object.keys(groupedByTech);

    // Lấy unique các khoảng min-max cho từng công nghệ in
    const headersByTech = printingTechnologies.map(tech => {
        const uniqueRanges = Array.from(
            new Map(
                groupedByTech[tech].map(rule => {
                    const min = rule.condition?.minQuantity ?? '';
                    const max = rule.condition?.maxQuantity ?? '';
                    const key = `${min}-${max ?? '+'}`;
                    return [key, rule];
                })
            ).values()
        );
        return {
            tech,
            ranges: uniqueRanges.map(rule => {
                const min = rule.condition?.minQuantity ?? '';
                const max = rule.condition?.maxQuantity ?? '';
                return { label: `Margin (${min}${max ? `-${max}` : '+'})`, rule };
            })
        };
    });

    return (
        <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center px-4 mx-4 ">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-7xl mx-auto p-6 z-50">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-[#F58A71] text-2xl font-bold transition-colors duration-200"
                    aria-label="Đóng"
                >
                    ×
                </button>
                <Dialog.Title className="text-xl font-semibold mb-6 capitalize text-start text-gray-900">Printed By {title}</Dialog.Title>
                <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                    <table className="table-fixed border-collapse w-full min-w-[900px]">
                        <thead className="bg-gradient-to-r from-[#F58A71] to-[#E07B6A] text-white w-full table table-fixed">
                            <tr>
                                <th className="border border-[#F58A71] px-4 py-3 text-center font-semibold">Color</th>
                                <th className="border border-[#F58A71] px-4 py-3 text-center font-semibold">Size</th>
                                {headersByTech.map(({ tech, ranges }) =>
                                    ranges.map((range, idx) => (
                                        <th key={tech + idx} className="border border-[#F58A71] px-4 py-3 text-center font-semibold">
                                            {range.label}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>

                        {/* Scrollable tbody */}
                        <tbody
                            className="block max-h-[500px] overflow-y-auto w-full"
                            style={{ display: "block" }}
                        >
                            {variantValues.map(({ name, size }, vIdx) => (
                                <tr key={vIdx} className="table table-fixed w-full hover:bg-orange-50 transition-colors duration-200 border-b border-gray-100">
                                    <td className="border border-gray-200 px-4 py-3 text-center">
                                        <div
                                            className="w-6 h-6 rounded-full border-2 border-gray-300 ring-2 ring-transparent hover:ring-[#F58A71] transition-all duration-200 mx-auto cursor-pointer"
                                            style={{ backgroundColor: name.split("-")[1] }}
                                            title={name}
                                        ></div>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-800">{size}</td>
                                    {headersByTech.map(({ tech, ranges }) =>
                                        ranges.map((range, idx) => (
                                            <td key={tech + idx} className="border border-gray-200 px-4 py-3 text-center">
                                                <span className="font-semibold text-[#F58A71]">
                                                    {formatMoney(range.rule.price as number, range.rule.currency as string)}
                                                </span>
                                            </td>
                                        ))
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </Dialog>
    )
}

export default MarginPricePopup
