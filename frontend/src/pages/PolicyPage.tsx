import React from "react";

const PolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a2a4a] text-white px-4 py-10 text-sm">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-2xl font-bold text-center text-blue-400">
          Policies & Contact
        </h1>

        <div className="space-y-4 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-1">
              Terms & Conditions
            </h2>
            <p>
              Hustly.in is a digital platform that allows users to purchase
              courses and eBooks, and also earn through affiliate links. By
              using this platform, you agree to comply with all applicable laws
              and respect intellectual property rights. Any misuse, unauthorized
              distribution, or manipulation of affiliate features will result in
              account termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-1">
              Refunds and Cancellation
            </h2>
            <p>
              All purchases on Hustly.in are final and non-refundable, as the
              products are digital in nature. Refunds may only be considered in
              case of technical issues that prevent access to the product and
              are reported within 24 hours of purchase. To request support,
              email <strong>hustly.in@gmail.com</strong> with your order
              details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-1">
              Contact Us
            </h2>
            <p>
              For any support, feedback, or inquiries related to products,
              affiliate programs, or technical issues, you can contact us at{" "}
              <strong>hustly.in@gmail.com</strong>. Our team is available to
              assist you during business hours and we aim to resolve all issues
              promptly and professionally.
            </p>
          </section>
        </div>

        <div className="text-center mt-8 text-gray-400">
          <p>
            <span className="font-bold text-gray-200">Support Email:</span>{" "}
            hustly.in@gmail.com
          </p>
          <p className="font-bold text-gray-200 mt-2">
            © {new Date().getFullYear()} - Hustly.in
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
