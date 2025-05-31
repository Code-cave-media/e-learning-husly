import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";

const PaymentVerification = () => {
  const [timeLeft, setTimeLeft] = useState(30); // 5 minutes in seconds
  const navigate = useNavigate();
  const { state } = useLocation();
  const { transactionId } = state || {};
  const { fetching, makeApiCall } = useAPICall();
  const [paymentStatus, setPaymentStatus] = useState<
    "captured" | "failed" | null
  >(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setPaymentStatus("failed");
          clearInterval(timer);
          return 0;
        }
        if (prevTime % 5 === 0) {
          verifyPayment();
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paymentStatus === "captured" || paymentStatus === "failed") {
      const redirectTimer = setTimeout(() => {
        if (paymentStatus === "captured") {
          navigate("/login");
        }
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }
  }, [paymentStatus]);

  const verifyPayment = async () => {
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.PAYMENT_VERIFICATION,
      {
        transaction_id: transactionId,
      },
      "application/json",
      null,
      "paymentVerification"
    );
    if (response.status === 200) {
      setPaymentStatus(response.data.status);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!transactionId) {
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
          <p className="text-gray-300 mb-8">
            Please try again or contact support if the problem persists.
          </p>
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

  const renderCircleContent = () => {
    if (paymentStatus === "captured") {
      return (
        <>
          <circle
            className="text-green-500"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <path
            className="text-green-500"
            strokeWidth="8"
            stroke="currentColor"
            fill="none"
            d="M30 50 L45 65 L70 35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    } else if (paymentStatus === "failed") {
      return (
        <>
          <circle
            className="text-red-500"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <path
            className="text-red-500"
            strokeWidth="8"
            stroke="currentColor"
            fill="none"
            d="M35 35 L65 65 M65 35 L35 65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    } else {
      return (
        <>
          <circle
            className="text-gray-700"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className="text-[#00b0ff]"
            strokeWidth="8"
            strokeDasharray={`${(timeLeft / 300) * 251.2} 251.2`}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />
        </>
      );
    }
  };

  const renderStatusText = () => {
    if (paymentStatus === "captured") {
      return (
        <>
          <h1 className="text-2xl font-bold mb-4 text-green-500">
            Payment Successful!
          </h1>
          <p className="text-gray-400 mb-6">
            Your payment has been verified successfully. Redirecting you to the
            dashboard...
          </p>
        </>
      );
    } else if (paymentStatus === "failed") {
      return (
        <>
          <h1 className="text-2xl font-bold mb-4 text-red-500">
            Payment Failed
          </h1>
          <p className="text-gray-400 mb-4">We couldn't verify your payment.</p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-500 text-sm mb-2">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
            <p className="text-gray-400 text-sm">
              If you have completed the payment but still see this message,
              please contact our support team with the transaction ID above.
            </p>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Payment Verification in Progress
          </h1>
          <p className="text-gray-400 mb-6">
            Please do not close this window or press the back button while we
            verify your payment. This process may take up to 5 minutes.
          </p>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a2a4a] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0d1117] rounded-lg shadow-lg p-8 text-white text-center">
        <div className="mb-8">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {renderCircleContent()}
            </svg>
            {!paymentStatus && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                {`${minutes.toString().padStart(2, "0")}:${seconds
                  .toString()
                  .padStart(2, "0")}`}
              </div>
            )}
          </div>

          {renderStatusText()}

          {!paymentStatus && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <p className="text-yellow-500 text-sm">
                ⚠️ Important: Do not refresh the page or navigate away while
                verification is in progress.
              </p>
            </div>
          )}

          {paymentStatus && (
            <Button
              onClick={() => navigate("/")}
              className="bg-[#00b0ff] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Return to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
