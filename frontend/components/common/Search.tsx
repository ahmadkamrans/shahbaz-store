'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api/categories';
import { productsApi } from '@/lib/api/products';
import { Category, Product } from '@/types';

interface SearchProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Search({ isOpen, onToggle }: SearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    products: Product[];
    categories: Category[];
  }>({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus input when search opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions({ products: [], categories: [] });
        setShowSuggestions(false);
        return;
      }

      try {
        setLoading(true);
        const searchTerm = query.trim().toLowerCase();

        // Fetch categories and filter by name
        const categories = await categoriesApi.getCategories();
        const matchingCategories = categories.filter(cat =>
          cat.name.toLowerCase().includes(searchTerm) ||
          (cat.slug && cat.slug.toLowerCase().includes(searchTerm))
        ).slice(0, 3);

        // Fetch products (limited to 5 for suggestions)
        const productsResult = await productsApi.getProducts({
          search: query.trim(),
          limit: 5,
        });

        setSuggestions({
          products: productsResult.products,
          categories: matchingCategories,
        });
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
        setSuggestions({ products: [], categories: [] });
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
      onToggle();
    }
  };

  const handleSuggestionClick = (searchTerm: string) => {
    router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    setQuery('');
    setShowSuggestions(false);
    onToggle();
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
    setQuery('');
    setShowSuggestions(false);
    onToggle();
  };

  return (
    <div
      ref={searchRef}
      className={`header-icon header-search header-search-popup header-search-category d-none d-sm-block ${isOpen ? 'show' : ''}`}
    >
      <a
        href="#"
        className="search-toggle"
        role="button"
        title="Search"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
      >
        <i className="icon-magnifier"></i>
      </a>
      <div className={`header-search-wrapper-container ${isOpen ? 'show' : ''}`}>
        <form action="#" method="get" onSubmit={handleSubmit}>
          <div className="header-search-wrapper">
            <input
              ref={inputRef}
              type="search"
              className="form-control"
              name="q"
              id="q"
              placeholder="Search products, categories, descriptions..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (query.trim().length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              required
            />
              <button className="btn" type="submit" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="icon-search-3"></i>}
              </button>
          </div>
        </form>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
          <div className="search-suggestions">
            {suggestions.categories.length > 0 && (
              <div className="suggestion-section">
                <div className="suggestion-header">Categories</div>
                {suggestions.categories.map((category) => (
                  <div
                    key={category.id}
                    className="suggestion-item"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <i className="icon-folder"></i>
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            )}

            {suggestions.products.length > 0 && (
              <div className="suggestion-section">
                <div className="suggestion-header">Products</div>
                {suggestions.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug || product.id}`}
                    className="suggestion-item"
                    onClick={() => {
                      setQuery('');
                      setShowSuggestions(false);
                      onToggle();
                    }}
                  >
                    <i className="icon-bag"></i>
                    <div className="suggestion-product">
                      <span className="suggestion-product-name">{product.name}</span>
                      {product.category && (
                        <span className="suggestion-product-category">{product.category}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="suggestion-footer">
              <button
                type="button"
                className="btn btn-sm btn-dark w-100"
                onClick={() => handleSuggestionClick(query.trim())}
              >
                View All Results for "{query}"
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

