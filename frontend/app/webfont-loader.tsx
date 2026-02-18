'use client';

import { useEffect } from 'react';

export function WebFontLoader() {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      WebFontConfig = {
        google: {
          families: ['Open+Sans:300,400,600,700,800', 'Poppins:300,400,500,600,700']
        }
      };
      (function(d) {
        var wf = d.createElement('script'),
            s = d.scripts[0];
        wf.src = '/assets/js/webfont.js';
        wf.async = true;
        s.parentNode.insertBefore(wf, s);
      })(document);
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}

