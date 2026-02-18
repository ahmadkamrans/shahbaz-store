export function HeadScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var cssFiles = [
              '/assets/css/bootstrap.min.css',
              '/assets/css/style.min.css',
              '/assets/css/demo29.min.css',
              '/assets/vendor/fontawesome-free/css/all.min.css',
              '/assets/vendor/simple-line-icons/css/simple-line-icons.min.css'
            ];
            cssFiles.forEach(function(href) {
              if (!document.querySelector('link[href="' + href + '"]')) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
              }
            });
          })();
        `,
      }}
    />
  );
}

