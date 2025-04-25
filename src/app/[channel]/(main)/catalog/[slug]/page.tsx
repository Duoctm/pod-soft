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
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Collection Products
        </h1>
        
        {category.products.edges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {category.products.edges.map((product) => (
              <Link
                href={`/${channel}/products/${product.node.slug}`}
                key={product.node.id} 
                className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
              >
                <div className="relative aspect-square w-full">
                  {product.node.thumbnail ? (
                    <Image
                      src={product.node.thumbnail.url}
                      alt={product.node.name}
                      fill
                      className="object-contain group-hover:scale-100 scale-90 transition-all duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-3 text-gray-800 line-clamp-2">
                    {product.node.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {product.node.name}
                  </p>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-xl text-gray-600">No products found in this collection.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in CatalogPage:", error);
    return (
      <div className="flex h-[70vh] items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">No data available.</p>
      </div>
    );
  }
};

export default CatalogPage;
