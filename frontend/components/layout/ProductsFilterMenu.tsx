"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const HEADER_GRADIENT =
  "linear-gradient(126deg, rgba(255, 168, 168, 1) 0%, rgba(112, 14, 119, 1) 36%, rgba(112, 14, 119, 1) 70%)";

interface ProductsFilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ProductsFilterMenu({
  isOpen,
  onClose,
  children,
}: ProductsFilterMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const content = (
    <>
      <div
        className="products-filter-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="products-filter-container products-filter-container--open"
        style={{ background: HEADER_GRADIENT }}
      >
        <div className="products-filter-wrapper">
          <span
            className="products-filter-close"
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClose()}
            aria-label="Close filters"
          >
            <i className="fa fa-times"></i>
          </span>
          <div className="products-filter-content">{children}</div>
        </div>
      </div>
    </>
  );

  if (mounted && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
