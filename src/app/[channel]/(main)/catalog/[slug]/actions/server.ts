"use server";

import { executeGraphQL } from "@/lib/graphql";
import { TypedDocumentString } from "@/gql/graphql";

// Định nghĩa kiểu dữ liệu cho fragment
type CollectionProductFragment = {
	id: string;
	name: string;
	productType: {
		id: string;
		name: string;
	};
	thumbnail: {
		url: string;
	} | null;
};

// Định nghĩa kiểu dữ liệu cho kết quả trả về
type CollectionProductsData = {
	collection: {
		id: string;
		products: {
			edges: Array<{
				node: CollectionProductFragment;
			}>;
			pageInfo: {
				endCursor: string | null;
				hasNextPage: boolean;
				hasPreviousPage: boolean;
				startCursor: string | null;
			};
		};
	} | null;
};

// Định nghĩa kiểu dữ liệu cho variables
type CollectionProductsVariables = {
	id: string;
	channel: string;
	first?: number | null;
	after?: string | null;
	last?: number | null;
	before?: string | null;
};

// Định nghĩa document cho query GraphQL
const CollectionProductsDocument = new TypedDocumentString<
	CollectionProductsData,
	CollectionProductsVariables
>(`
  query CollectionProducts($id: ID!, $channel: String!, $first: Int, $after: String, $last: Int, $before: String) {
    collection(id: $id, channel: $channel) {
      id
      products(
        first: $first
        after: $after
        before: $before
        last: $last
        sortBy: {field: COLLECTION, direction: ASC}
      ) {
        edges {
          node {
            id
            name
            productType {
              id
              name
            }
            thumbnail {
              url
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`);

/**
 * Server action để lấy thông tin sản phẩm trong collection
 * @param collectionId ID của collection
 * @param limit Số lượng sản phẩm cần lấy
 * @param channel Channel ID (bắt buộc)
 * @returns Luôn trả về true (chỉ để log kết quả)
 */
export async function fetchCollectionProducts(
	collectionId: string,
	limit: number = 10,
	channel: string = "default-channel",
) {
	try {
		// Gọi API GraphQL để lấy danh sách sản phẩm
		const result = await executeGraphQL(CollectionProductsDocument, {
			variables: {
				id: collectionId,
				channel: channel,
				first: limit,
			},
			cache: "no-cache",
		});


		return result;
	} catch (error) {
		console.error("[fetchCollectionProducts] Error:", error);
		return false;
	}
}
