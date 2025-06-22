/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { CheckoutResponse } from "@/types/apiTypes";
import { load } from "@cashfreepayments/cashfree-js";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const mockProduct = {
  thumbnail:
    "https://www.shutterstock.com/shutterstock/photos/2278726727/display_1500/stock-vector-minimalistic-circular-logo-sample-vector-2278726727.jpg",
  title: "Instagram CashPages Course",
  quantity: 1,
  price: 200,
};

const Checkout = () => {
  const [form, setForm] = useState({
    name: "lubina",
    email: "lubina@gmail.com",
    phone: "9876543210",
    password: "irshad1213",
    confirmPassword: "irshad1213",
  });
  const { id, type } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const [coupon, setCoupon] = useState("");
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [data, setData] = useState<CheckoutResponse | null>(null);
  const { fetchType, fetching, isFetched, makeApiCall } = useAPICall();
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.GET_CHECKOUT_DATA(id, type, ref, user?.user_id),
        null,
        "application/json"
      );
      if (response.status === 200) {
        setData({
          ...response.data,
          item_data: { ...response.data.item_data, discount: 0, coupon: null },
        });
      } else {
        setError(response.error);
      }
    };
    fetchData();
  }, []);
  console.log(API_ENDPOINT.GET_CHECKOUT_DATA(id, type, ref, user?.user_id));
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    // Mock coupon logic
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.APPLY_COUPON,
      {
        amount: data.item_data.price,
        code: coupon,
      },
      "application/json",
      null,
      "couponApply"
    );
    if (response.status === 200) {
      setData({
        ...data,
        item_data: {
          ...data.item_data,
          discount: response.data.discount,
          coupon: coupon,
        },
      });
      toast.success("Coupon applied successfully");
    } else {
      toast.error(response.error);
    }
  };
  const handleCheckout = async () => {
    if (
      !isAuthenticated &&
      !form.password &&
      !form.confirmPassword &&
      !form.name &&
      !form.email &&
      !form.phone
    ) {
      toast.error("Please enter all the required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Password and confirm password do not match");
      return;
    }

    // Ensure user_id is available for authenticated users
    if (isAuthenticated && !user?.user_id) {
      toast.error("User session expired. Please login again.");
      return;
    }

    const requestData = {
      user_id: isAuthenticated ? user?.user_id : null,
      item_id: data?.item_data.id,
      item_type: type,
      affiliate_user_id: ref,
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      coupon: coupon,
      discount: data?.item_data.discount,
    };

    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.CHECKOUT,
      requestData,
      "application/json",
      null,
      "checkout"
    );
    if (response.status === 200) {
      handleCashfree(response.data);
    } else {
      toast.error(response.error || "Failed to initiate checkout");
    }
  };
  const handleCashfree = async (data: any) => {
    try {
      console.log(
        "Starting Cashfree initialization with sessionId:",
        data.payment_session_id
      );
      console.log("Cashfree App ID:", import.meta.env.VITE_CASHFREE_APP_ID);

      // First, load the Cashfree SDK
      const cashfree = await load({
        mode: "sandbox",
        env: "sandbox",
        appId: import.meta.env.VITE_CASHFREE_APP_ID,
        orderToken: data.payment_session_id,
        disableSentry: true,
        style: {
          backgroundColor: "#ffffff",
          color: "#11385b",
          fontFamily: "Lato",
          fontSize: "14px",
          errorColor: "#ff0000",
          theme: "light",
        },
      });

      console.log("Cashfree SDK loaded successfully:", cashfree);

      // Create the checkout options
      const options = {
        paymentSessionId: data.payment_session_id,
        returnUrl: (window.location.href =
          window.location.origin +
          "/payment-verification?transactionId=" +
          data.transaction_id +
          "&isFailed=false"),
        failureUrl: (window.location.href =
          window.location.origin +
          "/payment-verification?transactionId=" +
          data.transaction_id +
          "&isFailed=true"),
        onPaymentSuccess: function (response: any) {
          console.log("Payment Success:", response);
          window.location.href =
            window.location.origin +
            "/payment-verification?transactionId=" +
            data.transaction_id +
            "&isFailed=false";
        },
        onPaymentFailure: function (response: any) {
          console.error("Payment Failure:", response);
          window.location.href =
            window.location.origin +
            "/payment-verification?transactionId=" +
            data.transaction_id +
            "&isFailed=true";
        },
        onClose: function () {
          console.log("Payment window closed");
        },
      };
      // Initialize the checkout
      try {
        const checkout = await cashfree.checkout(options);
      
        // Open the checkout window
        await checkout.open();
        console.log("Cashfree checkout window opened successfully");
      } catch (checkoutError) {
        console.error("Checkout failed with error:", checkoutError);
        
      }
    } catch (error) {
      console.error("Payment initialization failed with error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  const handleRazorpay = async (orderResponse: {
    amount: number;
    id: string;
  }) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_TEST_KEY,
      amount: orderResponse.amount,
      currency: "INR",
      name: "Your Site Name",
      description: "Course / E-Book Purchase",
      order_id: orderResponse.id,
      handler: function (response) {
        navigate("/payment-verification", {
          state: {
            transactionId: response.razorpay_payment_id,
          },
        });
      },
      prefill: {
        name: user ? user.name : form.name,
        email: user ? user.email : form.email,
        contact: user ? user.phone : form.phone,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const initializeSDK = async () => {
    try {
      const cashfree = await load({
        mode: "sandbox",
        env: "sandbox",
        appId: import.meta.env.VITE_CASHFREE_APP_ID,
        orderToken: "",
        disableSentry: true,
        style: {
          backgroundColor: "#ffffff",
          color: "#11385b",
          fontFamily: "Lato",
          fontSize: "14px",
          errorColor: "#ff0000",
          theme: "light",
        },
      });
      console.log(cashfree);
      console.log("initialized");
      return cashfree;
    } catch (error) {
      console.error("Failed to initialize Cashfree:", error);
      toast.error("Payment system initialization failed");
      throw error;
    }
  };
  if (fetching && fetchType !== "couponApply" && fetchType !== "checkout") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a2a4a] flex flex-col items-center p-4 relative pb-16">
        <Loading />
      </div>
    );
  }

  if (isFetched && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-[#1a2a4a] text-white p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-300 mb-8">{error}</p>
          <Button
            onClick={() => {
              navigate(-1);
            }}
            className="bg-[#00b0ff] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Return to landing
          </Button>
        </div>
      </div>
    );
  }
  if (data) {
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
          {data.affiliate_user && (
            <div className="mb-4">
              <span className="text-gray-400 text-sm">Referred by:</span>
              <div className="font-bold text-lg">
                {data.affiliate_user.name}
              </div>
            </div>
          )}

          {!isAuthenticated && (
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
          )}

          {/* Cart/Product Details */}
          <div className="mb-4 border-t border-gray-700 pt-4">
            <div className="flex items-center gap-4">
              <img
                src={data?.item_data.thumbnail}
                alt={data?.item_data.title}
                className="w-28 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <div className="font-bold text-lg">{mockProduct.title}</div>
                <div className="text-gray-400 text-sm">Qty: {1}</div>
              </div>
              <div className="font-bold text-lg">${data?.item_data.price}</div>
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
            <Button
              loading={fetching && fetchType === "couponApply"}
              type="submit"
              className="bg-[#00b0ff] text-white px-4 py-2 rounded hover:opacity-90 hover:bg-[#00b0ff]"
            >
              Apply
            </Button>
          </form>
          {/* {data?.item_data.coupon && (
            <div className="mb-4 text-green-400 text-sm">
              Coupon "{data.item_data.coupon}" applied! -$
              {data.item_data.discount}
            </div>
          )} */}

          {/* Price Summary */}
          <div className="mb-6 border-t border-gray-700 pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${data?.item_data.price}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Discount</span>
              <span>-${data?.item_data.discount}</span>
            </div>
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${data?.item_data.price - data?.item_data.discount}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            loading={fetching && fetchType === "checkout"}
            onClick={handleCheckout}
            className="w-full bg-[#00b0ff] text-white py-3 rounded text-lg font-bold hover:opacity-90"
          >
            Checkout
          </Button>
        </div>
      </div>
    );
  }
};

export default Checkout;
