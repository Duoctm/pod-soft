'use server'

import { GetPublicSettingsDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const getFAQ = async ({ channel, keys }: { channel: string; keys: string[] }) => {
    try {
        const { publicSettingsByKeys } = await executeGraphQL(GetPublicSettingsDocument, {
            variables: {
                channel: channel || "default-channel",
                keys: keys,
            },
        });

        if (!publicSettingsByKeys) {
            throw new Error("No FAQ found for the provided keys");
        }
        return publicSettingsByKeys;
    } catch (error) {
        console.error("Error fetching FAQ:", error);
        throw new Error("Failed to fetch FAQ");
    }
};