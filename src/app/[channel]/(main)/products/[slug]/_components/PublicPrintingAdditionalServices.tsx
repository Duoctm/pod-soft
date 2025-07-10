/* eslint-disable import/no-default-export */
import { ChevronDown } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { type PrintingAdditionalServiceCountableConnection } from '@/gql/graphql'
import { formatMoney } from '@/lib/utils'

type SelectedService = {
    id: string;
    name: string;
    price: number;
    currency: string;
};

type PublicPrintingAdditionalServicesProps = {
    services: Pick<PrintingAdditionalServiceCountableConnection, "edges" | "__typename"> | null,
    onChange?: (ids: string[], selectedServices: SelectedService[]) => void
}

const PublicPrintingAdditionalServices = ({ services, onChange }: PublicPrintingAdditionalServicesProps) => {
    const [isOpenAccordion, setIsOpenAccordion] = useState(false)
    const [height, setHeight] = useState(0)
    const contentRef = useRef<HTMLDivElement>(null)
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

    const toggleAccordion = () => {
        setIsOpenAccordion((prev) => {
            const next = !prev
            if (next && contentRef.current) {
                setHeight(contentRef.current.scrollHeight)
            } else {
                setHeight(0)
            }
            return next
        })
    }

    useEffect(() => {
        if (isOpenAccordion && contentRef.current) {
            setHeight(contentRef.current.scrollHeight)
        }
    }, [isOpenAccordion])

    // Gọi callback mỗi khi ids thay đổi
    useEffect(() => {
        if (!services) return; // Không gọi onChange khi không có dịch vụ
        const selectedServices =
            services.edges
                .filter(edge => selectedServiceIds.includes(edge.node.id))
                .map(edge => ({
                    id: edge.node.id,
                    name: edge.node.name ?? '',
                    price: Number(edge.node.price),
                    currency: edge.node.currency as string,
                }));
        // Chỉ gọi onChange khi có thay đổi thực sự
        if (selectedServiceIds.length > 0) {
            onChange?.(selectedServiceIds, selectedServices);
        }
    }, [selectedServiceIds, onChange, services])

    const handleCheckboxChange = (id: string) => {
        setSelectedServiceIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        )
    }

    return (
        <div className='w-full'>
            <div
                className='flex items-center justify-between p-2 border-b mt-4 border-gray-200 cursor-pointer'
                onClick={toggleAccordion}
            >
                <div>Options</div>
                <ChevronDown
                    className={`transition-transform duration-300 ${isOpenAccordion ? 'rotate-180' : ''}`}
                />
            </div>
            <div
                style={{
                    height: isOpenAccordion ? height : 0,
                    transition: 'height 0.3s',
                    overflow: 'hidden',
                }}
            >
                <div ref={contentRef} className='p-4'>
                    <div className='text-sm text-gray-600 mb-2'>
                        Additional services are available for this product. Please select the options you would like to add.
                    </div>
                    <div className='mb-2 text-sm font-medium text-[#8C3859]'>
                        Selected: {selectedServiceIds.length}
                    </div>
                    {
                        !services || services.edges.length === 0 ? (
                            <div className='text-sm text-gray-500'>No additional services available.</div>
                        ) : (
                            <ul className='list-none pl-0'>
                                {services.edges.map((edge) => (
                                    <li key={edge.node.id} className='mb-2 flex items-start gap-2'>
                                        <input
                                            type="checkbox"
                                            id={`service-${edge.node.id}`}
                                            name={`service-${edge.node.id}`}
                                            className="mt-1"
                                            checked={selectedServiceIds.includes(edge.node.id)}
                                            onChange={() => handleCheckboxChange(edge.node.id)}
                                        />
                                        <label htmlFor={`service-${edge.node.id}`} className="flex  flex-1 justify-between cursor-pointer">
                                            <span className='font-semibold'>{edge.node.name}</span>
                                            <span className='text-sm text-gray-500'>
                                                {formatMoney(Number(edge.node.price), edge.node.currency as string)}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default PublicPrintingAdditionalServices
