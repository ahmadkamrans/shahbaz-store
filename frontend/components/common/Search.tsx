'use client';

import { useState } from 'react';

interface SearchProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Search({ isOpen, onToggle }: SearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search
    console.log('Search:', query);
  };

  return (
    <div className="header-icon header-search header-search-popup header-search-category d-none d-sm-block">
      <a href="#" className="search-toggle" role="button" onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}>
        <i className="icon-magnifier"></i>
      </a>
      {isOpen && (
        <form action="#" method="get" onSubmit={handleSubmit}>
          <div className="header-search-wrapper">
            <input
              type="search"
              className="form-control"
              name="q"
              id="q"
              placeholder="I'm searching for..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button className="btn icon-search-3" type="submit"></button>
          </div>
          {/* End .header-search-wrapper */}
        </form>
      )}
    </div>
  );
}

