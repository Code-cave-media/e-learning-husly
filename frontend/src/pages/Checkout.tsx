import React, { useState } from "react";

const mockAffiliate = { name: "John Doe" };
const mockProduct = {
  thumbnail:
    "https://www.shutterstock.com/shutterstock/photos/2278726727/display_1500/stock-vector-minimalistic-circular-logo-sample-vector-2278726727.jpg",
  title: "Instagram CashPages Course",
  quantity: 1,
  price: 200,
};

const Checkout = () => {
  // User info state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  // Coupon state
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    // Mock coupon logic
    if (coupon.trim().toLowerCase() === "save20") {
      setDiscount(20);
      setAppliedCoupon(coupon);
    } else {
      setDiscount(0);
      setAppliedCoupon("");
      alert("Invalid coupon code");
    }
  };

  const total = mockProduct.price - discount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a2a4a] flex flex-col items-center p-4 relative pb-16">
      {/* Razorpay secure payment fixed badge */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-[#181f2a] px-4 py-2 rounded-lg shadow-lg z-50 border border-[#00b0ff]">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe32vAJ7iuV_GjZlu-EyKf7GQ-You53h-wNg&s"
          alt="Razorpay Secure"
          className="w-8 h-8 object-contain"
        />
        <span className="text-sm text-white font-semibold">
          Secure payment with <span className="text-[#00b0ff]">Razorpay</span>
        </span>
      </div>

      <div className="w-full max-w-lg bg-[#0d1117] rounded-lg shadow-lg p-6 mt-10 text-white">
        {/* Affiliate User Details */}
        <div className="mb-4">
          <span className="text-gray-400 text-sm">Referred by:</span>
          <div className="font-bold text-lg">{mockAffiliate.name}</div>
        </div>

        {/* User Information Form (no submit button) */}
        <form
          className="flex flex-col gap-3 mb-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleFormChange}
            className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleFormChange}
            className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleFormChange}
            className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleFormChange}
            className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleFormChange}
            className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
            required
          />
        </form>

        {/* Cart/Product Details */}
        <div className="mb-4 border-t border-gray-700 pt-4">
          <div className="flex items-center gap-4">
            <img
              src={mockProduct.thumbnail}
              alt={mockProduct.title}
              className="w-20 h-20 rounded object-cover"
            />
            <div className="flex-1">
              <div className="font-bold text-lg">{mockProduct.title}</div>
              <div className="text-gray-400 text-sm">
                Qty: {mockProduct.quantity}
              </div>
            </div>
            <div className="font-bold text-lg">${mockProduct.price}</div>
          </div>
        </div>

        {/* Coupon Code Section */}
        <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
          />
          <button
            type="submit"
            className="bg-[#00b0ff] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Apply
          </button>
        </form>
        {appliedCoupon && (
          <div className="mb-4 text-green-400 text-sm">
            Coupon "{appliedCoupon}" applied! -${discount}
          </div>
        )}

        {/* Price Summary */}
        <div className="mb-6 border-t border-gray-700 pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${mockProduct.price}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Discount</span>
            <span>-${discount}</span>
          </div>
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button className="w-full bg-[#00b0ff] text-white py-3 rounded text-lg font-bold hover:opacity-90">
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Checkout;
