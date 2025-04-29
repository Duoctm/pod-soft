"use server";

import { GraphQLClient, gql } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

// Define the types for our collection data
export interface Collection {
	id: string;
	name: string;
	slug: string;
	backgroundImage: {
		url: string;
		alt: string;
	} | null;
}

interface CollectionsResponse {
	collections: {
		edges: {
			node: Collection;
		}[];
	};
}

// GraphQL query to fetch collections with channel parameter
const GET_COLLECTIONS = gql`
	query GetCollections($channel: String!) {
		collections(first: 20, channel: $channel) {
			edges {
				node {
					id
					name
					slug
					backgroundImage {
						url
						alt
					}
				}
			}
		}
	}
`;

export async function getCollections(channelSlug: string) {
	console.log("Channel slug received:", channelSlug);
	
	// Create a GraphQL client
	const client = new GraphQLClient(SALEOR_API_URL);

	// Fetch collections from the GraphQL API with the channel parameter
	try {
		const data = await client.request<CollectionsResponse>(GET_COLLECTIONS, {
			channel: channelSlug
		});
		
		// Transform the GraphQL response into a more usable format
		const collections: Collection[] = data?.collections?.edges.map(({ node }) => node) || [];
		return collections;
	} catch (error) {
		console.error("GraphQL request error:", error);
		throw error;
	}
}