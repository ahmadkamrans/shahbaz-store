'use client';

import { useEffect } from 'react';

export function CSSLoader() {
  useEffect(() => {
    // Check if CSS links are already added
    if (document.querySelector('link[href="/assets/css/bootstrap.min.css"]')) {
      return;
    }

    // Add main CSS files
    const cssFiles = [
      '/assets/css/bootstrap.min.css',
      '/assets/css/style.min.css',
      '/assets/css/demo29.min.css',
    ];

    cssFiles.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

