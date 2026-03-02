"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const testimonials = [
  {
    name: "John Smith",
    role: "SMARTWAVE CEO",
    image: "/assets/images/clients/client1.png",
    quote:
      "Lorem ipsum dolor sit amet, consectetur elitad adipiscing Cras non placerat mipsum dolor sit amet, consectetur elitad adipiscing cas non placerat mi.",
  },
  {
    name: "Bob Smith",
    role: "SMARTWAVE CEO",
    image: "/assets/images/clients/client2.png",
    quote:
      "Lorem ipsum dolor sit amet, consectetur elitad adipiscing Cras non placerat mipsum dolor sit amet, consectetur elitad adipiscing cas non placerat mi.",
  },
];

const counters = [
  { to: 200, suffix: "+", label: "MILLION CUSTOMERS", lineHeight1: false },
  { to: 1800, suffix: "+", label: "TEAM MEMBERS", lineHeight1: false },
  { to: 24, suffix: "HR", label: "SUPPORT AVAILABLE", lineHeight1: true },
  { to: 265, suffix: "+", label: "COUNTRIES COVERED", lineHeight1: false },
  { to: 99, suffix: "%", label: "SATISFACTION RATE", lineHeight1: true },
];

function CountUp({
  to,
  suffix,
  duration = 2000,
  lineHeight1 = false,
}: {
  to: number;
  suffix: string;
  duration?: number;
  lineHeight1?: boolean;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || started) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setStarted(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, to, duration]);

  return (
    <div
      ref={ref}
      className={`count-wrapper${lineHeight1 ? " line-height-1" : ""}`}
    >
      <span className="count-to">
        {count}
        {suffix}
      </span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="main about">
      <div
        className="page-header page-header-bg text-left"
        style={{
          background:
            "50%/cover #D4E1EA url('/assets/images/page-header-bg.jpg')",
        }}
      >
        <div className="container">
          <h1>
            <span>ABOUT US</span>
            OUR COMPANY
          </h1>
          <Link href="/contact" className="btn btn-dark">
            Contact
          </Link>
        </div>
      </div>

      <nav aria-label="breadcrumb" className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">
                <i className="icon-home"></i>
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              About Us
            </li>
          </ol>
        </div>
      </nav>

      <div className="about-section">
        <div className="container">
          <h2 className="subtitle">OUR STORY</h2>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book. It has survived
            not only five centuries, but also the leap into electronic
            typesetting, remaining essentially unchanged.
          </p>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book.
          </p>
          <p className="lead">
            &ldquo; Many desktop publishing packages and web page editors now
            use Lorem Ipsum as their default model search for evolved over
            sometimes by accident, sometimes on purpose &rdquo;
          </p>
        </div>
      </div>

      <div className="features-section bg-gray">
        <div className="container">
          <h2 className="subtitle">WHY CHOOSE US</h2>
          <div className="row">
            <div className="col-lg-4">
              <div className="feature-box bg-white">
                <i className="icon-shipped"></i>
                <div className="feature-box-content p-0">
                  <h3>Free Shipping</h3>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industr.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="feature-box bg-white">
                <i className="icon-us-dollar"></i>
                <div className="feature-box-content p-0">
                  <h3>100% Money Back Guarantee</h3>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industr.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="feature-box bg-white">
                <i className="icon-online-support"></i>
                <div className="feature-box-content p-0">
                  <h3>Online Support 24/7</h3>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industr.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="testimonials-section">
        <div className="container">
          <h2 className="subtitle text-center">HAPPY CLIENTS</h2>
          <div className="row">
            {testimonials.map((t, i) => (
              <div key={i} className="col-lg-6 mb-4">
                <div className="testimonial">
                  <div className="testimonial-owner">
                    <figure>
                      <Image
                        src={t.image}
                        alt={t.name}
                        width={60}
                        height={60}
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </figure>
                    <div>
                      <strong className="testimonial-title">{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                  <blockquote>
                    <p>{t.quote}</p>
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="counters-section bg-gray">
        <div className="container">
          <div className="row">
            {counters.map((c, i) => (
              <div key={i} className="col-6 col-md-4 count-container">
                <CountUp
                  to={c.to}
                  suffix={c.suffix}
                  lineHeight1={c.lineHeight1}
                />
                <h4 className="count-title">{c.label}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
