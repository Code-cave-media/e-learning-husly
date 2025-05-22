import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const Landing = () => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowBuyButton(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleBuyNowClick = () => {
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col items-center bg-black text-white p-5 font-sans min-h-screen bg-gradient-to-b from-black to-[#1a2a4a]">
      <div className="mb-5 w-20 h-20 rounded-full bg-gray-700 flex justify-center items-center overflow-hidden">
        <img
          src="https://www.shutterstock.com/shutterstock/photos/2278726727/display_1500/stock-vector-minimalistic-circular-logo-sample-vector-2278726727.jpg"
          alt="Logo"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-sm mb-2 text-center text-gray-400">
        Limited Time Training Reveals:
      </div>

      <div className="text-xl font-bold text-center mb-5 text-white">
        How I Made ₹324,000+ With{" "}
        <span className="text-[#00b0ff]">Automated Instagram CashPages</span>
      </div>

      <div className="text-lg mb-5 text-center">
        Watch The Complete Video Below
      </div>

      <div className="w-full max-w-sm aspect-video bg-gray-800 mb-5 flex justify-center items-center relative">
        <video
          controls
          className="w-full h-full"
          poster="https://marketplace.canva.com/EAEqfS4X0Xw/1/0/1600w/canva-most-attractive-youtube-thumbnail-wK95f3XNRaM.jpg"
        >
          <source
            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {timeLeft !== 0 && (
        <div className="flex justify-center gap-5 mb-5">
          {["HOUR", "MINUTE", "SECOND"].map((label, index) => (
            <div className="flex flex-col items-center" key={label}>
              <div className="w-16 h-16 rounded-full border-2 border-white flex justify-center items-center text-xl font-bold">
                {formatTime(timeLeft).split(":")[index]}
              </div>
              <span className="text-xs uppercase">{label}</span>
            </div>
          ))}
        </div>
      )}

      {showBuyButton && (
        <button
          onClick={handleBuyNowClick}
          className="bg-[#00b0ff] text-white px-8 py-3 border-none rounded text-lg cursor-pointer mt-5 transition-opacity hover:opacity-90 w-full max-w-sm"
        >
          Buy Now
        </button>
      )}

      {/* Radix Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn" />
          <Dialog.Content className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-[#0d1117] text-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-slideIn">
            <Dialog.Title className="text-xl font-bold mb-4">
              Sign Up
            </Dialog.Title>
            <Dialog.Description className="mb-4 text-gray-400">
              Enter your details to create an account.
            </Dialog.Description>

            <form className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name"
                className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                className="bg-gray-800 border border-gray-600 p-2 rounded text-white outline-none"
              />
              <button
                type="submit"
                className="bg-[#00b0ff] text-white p-2 rounded hover:opacity-90"
              >
                Course for 200$
              </button>
            </form>

            <Dialog.Close asChild>
              <button
                className="absolute top-3 right-3 rounded-full text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Landing;
