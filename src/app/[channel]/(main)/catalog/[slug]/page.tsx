import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { executeGraphQL } from '@/lib/graphql';
import { ProductListByCategoryDocument } from '@/gql/graphql';
import { notFound } from 'next/navigation';
 
export interface PageProps {
  params: {
    slug: string;
    channel: string;
  };
}

const CatalogPage = async ({ params }: PageProps) => {
  const { slug, channel } = params;
  
  try {
    // Make sure we're passing a valid ID
    if (!slug) {
      throw new Error("Collection ID is missing");
    }
    
    const { category } = await executeGraphQL(ProductListByCategoryDocument, {
      variables: { slug: params.slug, channel: params.channel },
      revalidate: 60,
    });
    if (!category || !category.products) {
      notFound();
    }
  
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
        Collection Products
        </h1>
        
        {category.products.edges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.products.edges.map((product) => (
              <Link
              href={`/${channel}/products/${product.node.slug}`}
              key={product.node.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-64">
                  {product.node.thumbnail ? (
                    <Image
                      src={product.node.thumbnail.url}
                      alt={product.node.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">{product.node.name}</h2>
                  <p className="text-sm text-gray-600 mb-4">{product.node.name}</p>
                  
                  {/* <Link 
                    href={`/${channel}/products/${product.node.id}`}
                    className="block w-full bg-[#343573] text-white text-center py-2 rounded-md hover:bg-[#2a2a5e] transition-colors"
                  >
                    View Details
                  </Link> */}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products found in this collection.
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in CatalogPage:", error);
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="">No data.</p>
      </div>
    );
  }
};

export default CatalogPage;
