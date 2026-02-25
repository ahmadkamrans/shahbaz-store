import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: number;
  viewMode?: 'grid' | 'list';
}

export function ProductGrid({ products, columns = 6, viewMode = 'grid' }: ProductGridProps) {
  // Map columns to Bootstrap classes
  const colClasses: Record<number, string> = {
    2: 'col-6 col-md-6',
    3: 'col-6 col-md-4',
    4: 'col-6 col-md-3',
    5: 'col-6 col-md-4 col-lg-3 col-xl-2',
    6: 'col-6 col-md-4 col-lg-3 col-xl-2',
  };
  const colClass = viewMode === 'list' ? 'col-12' : (colClasses[columns] || 'col-6 col-md-4 col-lg-3 col-xl-2');

  return (
    <div className="products-container">
      <div className={`row ${viewMode === 'list' ? 'products-list' : ''}`}>
        {products.map((product) => (
          <div key={product.id} className={colClass}>
            <ProductCard product={product} viewMode={viewMode} />
          </div>
        ))}
      </div>
    </div>
  );
}

