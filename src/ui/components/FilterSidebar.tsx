/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import SkeletonLoading from './SkeletonLoading'
import { FilterOption } from './filter-options'
import { type ProductType, useProduct } from '@/app/[channel]/(main)/products/utils/useProduct'
import { getAttributes } from '@/app/[channel]/(main)/catalog/[slug]/actions/attributes'
import { getProductList } from '@/app/[channel]/(main)/products/[slug]/actions/getProductList'
import { ProductsPerPage } from '@/app/config'
import { filterOptions } from '@/app/[channel]/(main)/catalog/[slug]/actions/filter-option'
import { useFilterSidebar } from '@/actions/useFilterSidebar'
interface FilterAttribute {
    slug: string;
    values: string[];
}


const MAX_VISIBLE_OPTIONS = 4

const FilterSidebar = ({ channel }: { channel: string }) => {
    const { attibutes, setAttributes, setProducts } = useProduct()
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()

    const [expandedAttributes, setExpandedAttributes] = React.useState<Record<string, boolean>>({});

    const { isOpen, onClose } = useFilterSidebar()

    const toggleExpand = (slug: string) => {
        setExpandedAttributes(prev => ({
            ...prev,
            [slug]: !prev[slug]
        }));
    };

    const fetchAttributes = async () => {
        const attribute = await getAttributes()
        console.log(attribute)
        if (attribute) {
            setAttributes(attribute as ProductType["attibutes"])
        }
    }

    const formatValue = (value: string): string => {
        return value
            .toLowerCase()
            .replace(/[&]/g, '-') // Replace & with -
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/-+/g, '-')  // Replace multiple - with single -
            .replace(/^-|-$/g, ''); // Remove - from start and end
    };

    const handleSelect = (slug: string, value: string) => {
        if (slug, value) {
            const formattedValue = formatValue(value);
            router.push(`${pathname}?${createQueryString(slug, formattedValue)}`);
        }
    }

    const createQueryString = (slug: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const queryParams = params.get(slug);

        if (queryParams) {
            const values = queryParams.split(",");
            if (!values.includes(value)) {
                values.push(value);
                params.set(slug, values.join(","));
            } else {
                const filteredValues = values.filter((v) => v !== value);
                if (filteredValues.length > 0) {
                    params.set(slug, filteredValues.join(","));
                } else {
                    params.delete(slug);
                }
            }
        } else {
            params.set(slug, value);
        }

        return params.toString();
    }

    const handleFilterOptions = async () => {
        // Get all current search params and convert to array format
        const filterVal: FilterAttribute[] = [];

        searchParams.forEach((values, slug) => {
            const valueArray = values.split(',').filter(value => value !== '');
            if (valueArray.length > 0) {
                filterVal.push({
                    slug,
                    values: valueArray
                });
            }
        });

        const hasFilter = filterVal.length > 0;

        console.log('Filter Values:', filterVal);
        console.log('Has Filter:', hasFilter);

        if (!hasFilter) {
            const defaultProducts = await getProductList({
                first: ProductsPerPage,
                after: null,
                channel: channel
            });

            if (defaultProducts) {
                setProducts(defaultProducts as ProductType["products"]);
            }
        } else {
            const productFilter = await filterOptions({
                filterAttributes: filterVal,
                channel: channel,
                first: ProductsPerPage,
                after: null,
            });
            console.log(productFilter)

            if (productFilter) {
                setProducts(productFilter as ProductType["products"]);
            }
        }
        // setLoading(!loading)
    };

    // Add useEffect to call handleFilterOptions when search params change
    useEffect(() => {
        void handleFilterOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const isOptionSelected = (paramName: string, value: string): boolean => {
        const currentValue = searchParams.get(paramName);
        if (!currentValue) return false;
        const formattedValue = formatValue(value);
        return currentValue.split(',').includes(formattedValue);
    };

    useEffect(() => {
        void fetchAttributes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!attibutes) return <SkeletonLoading />

    const handleSoftAttributes = (attrs: ProductType["attibutes"]) => {
        // sort attributes to show specific ones first
        const sortAttributes = attrs?.edges
            .filter((attribute) => ["SIZE", "GENDER", "BRAND"].includes(attribute.node.name?.toUpperCase()))
            // Sort attributes in specific order
            .sort((a, b) => {
                const order = ["SIZE", "BRAND", "GENDER"];
                // const order = ["COLOR", "SIZE", "BRAND","GENDER", "PRINT TECHNOLOGY"];
                const aIndex = order.indexOf(a.node.name?.toUpperCase() || "");
                const bIndex = order.indexOf(b.node.name?.toUpperCase() || "");
                return aIndex - bIndex;
            })
        return sortAttributes;

    }




    const handleResetFilters = () => {
        router.replace(pathname);
    }





    return (
        <>
            <div className="max-w-[250px] w-full hidden lg:block">
                <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 sticky top-40 hidden h-[calc(100vh-160px)] w-full overflow-y-auto bg-white lg:block'>
                    <h2 className="mb-2 text-xl font-semibold capitalize text-gray-800 md:text-2xl lg:text-3xl">
                        Orders
                    </h2>

                    <button
                        onClick={handleResetFilters}
                        className="mb-4 w-full rounded-lg bg-[#8C3859] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8C3859]/50"
                    >
                        Reset Filters
                    </button>
                    {
                        attibutes ? (
                            handleSoftAttributes(attibutes)?.map((attribute) => {
                                const { slug, name, choices } = attribute.node;
                                console.log(name)
                                const options = choices?.edges || [];
                                return <Disclosure key={slug} defaultOpen>
                                    <div className="">
                                        <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-3 text-lg font-semibold capitalize text-gray-800 hover:bg-gray-50">
                                            <span>{name}</span>
                                            <ChevronDownIcon className="ui-open:rotate-180 h-5 w-5 transition-transform duration-200" />
                                        </Disclosure.Button>
                                        <Disclosure.Panel className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                                {options
                                                    .filter((choice) => !!choice.node.name)
                                                    .slice(0, slug && expandedAttributes[slug] ? undefined : MAX_VISIBLE_OPTIONS)
                                                    .map((choice) => (
                                                        <FilterOption
                                                            onSelect={() => handleSelect(slug as string, choice.node.name as string)}
                                                            isSelected={isOptionSelected(slug as string, choice.node.name as string)}
                                                            setIsFilterOpen={() => { }}
                                                            paramName={name?.toLocaleLowerCase() as string}
                                                            channel={channel}
                                                            slug={choice.node.slug as string}
                                                            setCategory={() => { }}
                                                            key={choice.node.name}
                                                            attributeName={choice.node.name as unknown as string}
                                                            paramValue={choice.node.slug as string}
                                                            isColor={name === "COLOR"}
                                                        />
                                                    ))}
                                                {options.length > 4 && slug && (
                                                    <button
                                                        onClick={() => toggleExpand(slug)}
                                                        className="ml-auto w-full text-right text-sm text-[#8C3859] hover:text-[#8C3859]/70"
                                                    >
                                                        {expandedAttributes[slug] ? 'Show Less' : `Show More (${options.length - 4})`}
                                                    </button>
                                                )}
                                            </div>
                                        </Disclosure.Panel>
                                    </div>
                                </Disclosure>

                            })
                        ) : null
                    }

                </div >
            </div >

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-50 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-gray-100"
                        >
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <button
                            onClick={handleResetFilters}
                            className="mb-4 w-full rounded-lg bg-[#8C3859] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8C3859]/50"
                        >
                            Reset Filters
                        </button>

                        {attibutes && handleSoftAttributes(attibutes)?.map((attribute) => {
                            const { slug, name, choices } = attribute.node;
                            const options = choices?.edges || [];
                            return (
                                <Disclosure key={slug} defaultOpen>
                                    <div className="mb-4">
                                        <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-3 text-lg font-semibold capitalize text-gray-800 hover:bg-gray-50">
                                            <span>{name}</span>
                                            <ChevronDownIcon className="ui-open:rotate-180 h-5 w-5 transition-transform duration-200" />
                                        </Disclosure.Button>
                                        <Disclosure.Panel className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                                {options
                                                    .filter((choice) => !!choice.node.name)
                                                    .slice(0, slug && expandedAttributes[slug] ? undefined : MAX_VISIBLE_OPTIONS)
                                                    .map((choice) => (
                                                        <FilterOption
                                                            onSelect={() => handleSelect(slug as string, choice.node.name as string)}
                                                            isSelected={isOptionSelected(slug as string, choice.node.name as string)}
                                                            setIsFilterOpen={() => { }}
                                                            paramName={name?.toLocaleLowerCase() as string}
                                                            channel={channel}
                                                            slug={choice.node.slug as string}
                                                            setCategory={() => { }}
                                                            key={choice.node.name}
                                                            attributeName={choice.node.name as unknown as string}
                                                            paramValue={choice.node.slug as string}
                                                            isColor={name === "COLOR"}
                                                        />
                                                    ))}
                                                {options.length > 4 && slug && (
                                                    <button
                                                        onClick={() => toggleExpand(slug)}
                                                        className="ml-auto w-full text-right text-sm text-[#8C3859] hover:text-[#8C3859]/70"
                                                    >
                                                        {expandedAttributes[slug] ? 'Show Less' : `Show More (${options.length - 4})`}
                                                    </button>
                                                )}
                                            </div>
                                        </Disclosure.Panel>
                                    </div>
                                </Disclosure>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4">
                        <button
                            onClick={onClose}
                            className="w-full rounded-lg bg-[#8C3859] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8C3859]/50"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

// eslint-disable-next-line import/no-default-export
export default FilterSidebar
