import Link from 'next/link';
import Image from 'next/image';

interface HomeBannerProps {
  image: string;
  imageWidth: number;
  imageHeight: number;
  title?: string;
  subtitle?: string;
  price?: string;
  link?: string;
  linkText?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string; // Applied to figure element
  couponText?: string;
  discountText?: string;
  titleClass?: string; // For adding classes like ls-10 to h3
  useH4?: boolean; // Use h4 instead of h3 for smaller banners
}

export function HomeBanner({
  image,
  imageWidth,
  imageHeight,
  title,
  subtitle,
  price,
  link = '/products',
  linkText,
  position = 'right',
  className = '',
  couponText,
  discountText,
  titleClass = '',
  useH4 = false,
}: HomeBannerProps) {
  const TitleTag = useH4 ? 'h4' : 'h3';
  
  return (
    <div className="home-banner">
      <figure className={className}>
        <Image src={image} alt="banner" width={imageWidth} height={imageHeight} />
      </figure>
      <div className={`banner-content content-${position}`}>
        {/* For top/bottom banners (h4), subtitle comes first */}
        {useH4 && subtitle && <span className="font2">{subtitle}</span>}
        {title && <TitleTag className={titleClass} dangerouslySetInnerHTML={{ __html: title }} />}
        {/* For regular banners (h3), subtitle comes after title */}
        {!useH4 && subtitle && <span className="font2">{subtitle}</span>}
        {price && <p className="font2">{price}</p>}
        {couponText && (
          <a href="#" className="btn skew-box">
            {couponText}
          </a>
        )}
        {discountText && (
          <h3 className="sale-off skew-box">
            <span>{discountText}</span>off
          </h3>
        )}
        {linkText && (
          <Link href={link || '#'} className="btn">
            {linkText} <i className="fas fa-long-arrow-alt-right"></i>
          </Link>
        )}
      </div>
    </div>
  );
}

