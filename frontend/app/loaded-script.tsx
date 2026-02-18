export function LoadedScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Add 'loaded' class immediately to prevent content from being hidden
          if (document.body && !document.body.classList.contains('loaded')) {
            document.body.classList.add('loaded');
          }
        `,
      }}
    />
  );
}

