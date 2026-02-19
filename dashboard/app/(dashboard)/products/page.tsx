import ProductsClient from './ProductsClient';
import { getDummyProducts, getDummyCategories } from '../../../lib/dummy/data';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const [productsData, categories] = await Promise.all([
    Promise.resolve(getDummyProducts({ page, limit: 20 })),
    Promise.resolve(getDummyCategories()),
  ]);

  return (
    <ProductsClient
      initialProducts={productsData.products as import('../../../lib/api/products.api').Product[]}
      initialCategories={categories as import('../../../lib/api/categories.api').Category[]}
      initialPagination={productsData.pagination}
    />
  );
}
