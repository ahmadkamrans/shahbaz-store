'use client';

import { useEffect } from 'react';

export function FontCSSLoader() {
  useEffect(() => {
    // Check if CSS links are already added
    if (document.querySelector('link[href="/assets/vendor/fontawesome-free/css/all.min.css"]')) {
      return;
    }

    // Add CSS files that have external dependencies (webfonts)
    const cssFiles = [
      '/assets/vendor/fontawesome-free/css/all.min.css',
      '/assets/vendor/simple-line-icons/css/simple-line-icons.min.css',
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

