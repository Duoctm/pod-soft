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
        <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center px-4 mx-4">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-7xl mx-auto p-6 z-50">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    aria-label="Đóng"
                >
                    ×
                </button>
                <Dialog.Title className="text-xl font-semibold mb-6 capitalize text-start">Printed By {title}</Dialog.Title>
                <div className="overflow-x-auto">
                    <table className="table-auto border-collapse border border-gray-300 w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2 text-center">Color</th>
                                <th className="border px-4 py-2 text-center">Size</th>
                                {headersByTech.map(({ tech, ranges }) =>
                                    ranges.map((range, idx) => (
                                        <th key={tech + idx} className="border px-4 py-2 text-center">
                                            {range.label}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {variantValues.map(({ name, size }, vIdx) => (
                                <tr key={vIdx} className="hover:bg-gray-50 transition">
                                    <td className="border px-4 py-2 text-center">
                                        <div
                                            className='w-6 h-6 rounded-full border-2 ring-2 mx-auto'
                                            style={{ backgroundColor: name.split("-")[1] }}
                                            title={name}
                                        ></div>
                                    </td>
                                    <td className="border px-4 py-2 text-center">{size}</td>
                                    {headersByTech.map(({ tech, ranges }) =>
                                        ranges.map((range, idx) => (
                                            <td key={tech + idx} className="border px-4 py-2 text-center">
                                                {formatMoney(range.rule.price as number, range.rule.currency as string)}
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
