'use client';

export function EarlyCSSLoader() {
  // This script runs synchronously before React hydrates
  // It loads CSS files immediately to prevent FOUC
  if (typeof window !== 'undefined') {
    const cssFiles = [
      '/assets/css/bootstrap.min.css',
      '/assets/css/style.min.css',
      '/assets/css/demo29.min.css',
      '/assets/vendor/fontawesome-free/css/all.min.css',
      '/assets/vendor/simple-line-icons/css/simple-line-icons.min.css',
    ];

    cssFiles.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }

  return null;
}

