
import { type PrintingTechnology } from "@/gql/graphql";

type MetadataItem = {
    key: string;
    value: string;
};

type PrintingInfo = {
    print_side: string;
    printing_technology: PrintingTechnology;
    additional_service_ids: string[];
};

export function usePrintingTechnology(metadata: MetadataItem[]): string | null {
    const printingTechnology = () => {
        const printingInfoItem = metadata.find(item => item.key === "printing_info");
        if (!printingInfoItem) return null;

        try {
            const parsed = JSON.parse(printingInfoItem.value) as PrintingInfo[];
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0].printing_technology || null;
            }
        } catch (error) {
            console.error("Failed to parse printing_info metadata:", error);
        }

        return null;
    }

    return printingTechnology();
}
