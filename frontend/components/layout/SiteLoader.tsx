"use client";

import Image from "next/image";

export function SiteLoader() {
  return (
    <div
      className="site-loader"
      role="status"
      aria-label="Loading"
    >
      <div className="site-loader__inner">
        <div className="site-loader__logo">
          <Image
            src="/assets/images/image.png"
            width={180}
            height={90}
            alt="Shahbaz"
            style={{ borderRadius: "8px" }}
            priority
          />
        </div>
        <div className="site-loader__line-wrap">
          <div className="site-loader__line" />
        </div>
      </div>
    </div>
  );
}
