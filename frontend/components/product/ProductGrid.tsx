import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: number;
  viewMode?: 'grid' | 'list';
  /** Theme column class for shop layout, e.g. col-6 col-md-4 col-lg-3 col-xl-5col */
  columnClass?: string;
}

export function ProductGrid({
  products,
  columns = 6,
  viewMode = 'grid',
  columnClass,
}: ProductGridProps) {
  const colClasses: Record<number, string> = {
    2: 'col-6 col-md-6',
    3: 'col-6 col-md-4',
    4: 'col-6 col-md-3',
    5: 'col-6 col-md-4 col-lg-3 col-xl-2',
    6: 'col-6 col-md-4 col-lg-3 col-xl-2',
  };
  const colClass =
    columnClass ||
    (viewMode === 'list' ? 'col-12' : (colClasses[columns] || 'col-6 col-md-4 col-lg-3 col-xl-2'));

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className={colClass}>
          <ProductCard product={product} viewMode={viewMode} variant="shop" />
        </div>
      ))}
    </>
  );
}

