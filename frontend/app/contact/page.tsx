"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const faqItems = [
  {
    id: "collapseOne",
    title: "Curabitur eget leo at velit imperdiet viaculis vitaes?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget leo at velit imperdiet varius. In eu ipsum vitae velit congue iaculis vitae at risus. Nullam tortor nunc, bibendum vitae semper a, volutpat eget massa.",
  },
  {
    id: "collapseTwo",
    title: "Curabitur eget leo at velit imperdiet vague iaculis vitaes?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget leo at velit imperdiet varius. In eu ipsum vitae velit congue iaculis vitae at risus. Nullam tortor nunc, bibendum vitae semper a, volutpat eget massa. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer.",
  },
  {
    id: "collapseThree",
    title: "Curabitur eget leo at velit imperdiet viaculis vitaes?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget leo at velit imperdiet varius. In eu ipsum vitae velit congue iaculis vitae at risus. Nullam tortor nunc, bibendum vitae semper a, volutpat eget massa.",
  },
  {
    id: "collapseFour",
    title: "Curabitur eget leo at velit imperdiet vague iaculis vitaes?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget leo at velit imperdiet varius. In eu ipsum vitae velit congue iaculis vitae at risus. Nullam tortor nunc, bibendum vitae semper a, volutpat eget massa. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer.",
  },
  {
    id: "collapseFive",
    title: "Curabitur eget leo at velit imperdiet varius iaculis vitaes?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget leo at velit imperdiet varius. In eu ipsum vitae velit congue iaculis vitae at risus. Nullam tortor nunc, bibendum vitae semper a, volutpat eget massa. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer.",
  },
];

export default function ContactPage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>("collapseOne");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Placeholder: replace with your API or mail endpoint
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="main">
      <div
        className="page-header page-header-bg text-left"
        style={{
          background:
            "50%/cover #D4E1EA url('/assets/images/page-header-bg.jpg')",
        }}
      >
        <div className="container">
          <h1>
            <span>CONTACT US</span>
            GET IN TOUCH
          </h1>
          <Link href="/about" className="btn btn-dark">
            About Us
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
              Contact Us
            </li>
          </ol>
        </div>
      </nav>

      <div className="container contact-us-container">
        <div className="contact-info">
          <div className="row">
            <div className="col-12">
              <h2 className="ls-n-25 m-b-1">Contact Info</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                imperdiet libero id nisi euismod, sed porta est consectetur.
                Vestibulum auctor felis eget orci semper vestibulum. Pellentesque
                ultricies nibh gravida, accumsan libero luctus, molestie nunc.L
                orem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="feature-box text-center">
                <i className="sicon-location-pin"></i>
                <div className="feature-box-content">
                  <h3>Address</h3>
                  <h5>123 Wall Street, New York / NY</h5>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="feature-box text-center">
                <i className="fa fa-mobile-alt"></i>
                <div className="feature-box-content">
                  <h3>Phone Number</h3>
                  <h5>(800) 123-4567</h5>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="feature-box text-center">
                <i className="far fa-envelope"></i>
                <div className="feature-box-content">
                  <h3>E-mail Address</h3>
                  <h5>
                    <a href="mailto:info@example.com">info@example.com</a>
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="feature-box text-center">
                <i className="far fa-calendar-alt"></i>
                <div className="feature-box-content">
                  <h3>Working Days/Hours</h3>
                  <h5>Mon - Sun / 9:00AM - 8:00PM</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <h2 className="mt-6 mb-2">Send Us a Message</h2>
            <form className="mb-0" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="mb-1" htmlFor="contact-name">
                  Your Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contact-name"
                  name="contact-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="mb-1" htmlFor="contact-email">
                  Your E-mail <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="contact-email"
                  name="contact-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="mb-1" htmlFor="contact-message">
                  Your Message <span className="required">*</span>
                </label>
                <textarea
                  cols={30}
                  rows={5}
                  id="contact-message"
                  className="form-control"
                  name="contact-message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="form-footer mb-0">
                <button
                  type="submit"
                  className="btn btn-dark font-weight-normal"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>

          <div className="col-lg-6">
            <h2 className="mt-6 mb-1">Frequently Asked Questions</h2>
            <div id="accordion">
              {faqItems.map((item) => {
                const isOpen = openAccordion === item.id;
                return (
                  <div key={item.id} className="card card-accordion">
                    <button
                      type="button"
                      id={`${item.id}-header`}
                      className={`card-header text-left${isOpen ? "" : " collapsed"}`}
                      onClick={() => toggleAccordion(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={item.id}
                    >
                      {item.title}
                    </button>
                    <div
                      id={item.id}
                      className="accordion-panel card-body"
                      style={{ display: isOpen ? "block" : "none" }}
                      role="region"
                      aria-labelledby={`${item.id}-header`}
                    >
                      <p>{item.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8"></div>
    </main>
  );
}
