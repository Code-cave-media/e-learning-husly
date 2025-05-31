import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { LandingPage } from "@/types/apiTypes";
import toast from "react-hot-toast";
import { Loading } from "@/components/ui/loading";

const Landing = () => {
  const { id, type } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const [timeLeft, setTimeLeft] = useState(10);
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, authToken } = useAuth();
  const { fetchType, fetching, makeApiCall,isFetched } = useAPICall();
  const [data, setData] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let response;
      if (type === "course") {
        response = await makeApiCall(
          "GET",
          API_ENDPOINT.GET_COURSE_LANDING_PAGE(id),
          null,
          "application/json",
          isAuthenticated ? authToken : ""
        );
      } else if (type == "ebook") {
        response = await makeApiCall(
          "GET",
          API_ENDPOINT.GET_EBOOK_LANDING_PAGE(id),
          null,
          "application/json",
          isAuthenticated ? authToken : ""
        );
      }
      if (response.status == 200) {
        const videoDuration = await getVideoDuration(response.data.intro_video);
        setTimeLeft(parseInt(`${videoDuration as number}`));
        setData(response.data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [ref, id, type]);
  useEffect(() => {
    if (ref && isFetched) {
      const totalClickedLinksStr = localStorage.getItem("totalClickedLinks");

      const totalClickedLinks: string[] = totalClickedLinksStr
        ? JSON.parse(totalClickedLinksStr)
        : [];
      console.log(totalClickedLinks);
      if (!totalClickedLinks.includes(`${type}/${id}/${ref}`)) {
        addClickAffiliateLink(totalClickedLinks);
      }
    }
  }, [ref, isFetched]);
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowBuyButton(true);
      return;
    }
    if (isPlaying) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, isPlaying]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const addClickAffiliateLink = async (totalClickedLinks: string[]) => {
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.ADD_CLICK_AFFILIATE_LINK,
      { affiliate_user_id: ref,item_id:id,item_type:type },
      "application/json",
    );
    if (response.status == 200) {
      localStorage.setItem(
        "totalClickedLinks",
        JSON.stringify([...totalClickedLinks, `${type}/${id}/${ref}`])
      );
    }
  };
  const handleBuyNowClick = () => {
    navigate(`/checkout/${type}/${id}?${ref ? `ref=${ref}` : ""}`);
  };
  const getVideoDuration = (videoUrl: string) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoUrl;
      video.crossOrigin = "anonymous";

      video.onloadedmetadata = () => {
        resolve(video.duration);
      };

      video.onerror = (e) => {
        reject(new Error("Failed to load video metadata"));
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center bg-black text-white p-5 font-sans min-h-screen bg-gradient-to-b from-black to-[#1a2a4a]">
        <Loading />
      </div>
    );
  }

  if (!isLoading && data == null) {
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
          <h1 className="text-2xl font-bold mb-4">Content Not Available</h1>
          <p className="text-gray-300 mb-8">
            {type === "course"
              ? "This course is either not found or not currently available for viewing."
              : "This ebook is either not found or not currently available for viewing."}
          </p>
          <Button
            onClick={() => {
              if (isAuthenticated) {
                if (isAdmin) {
                  navigate("/admin/dashboard");
                } else {
                  navigate("/user/dashboard");
                }
              } else {
                navigate("/");
              }
            }}
            className="bg-[#00b0ff] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center bg-black text-white p-5 font-sans min-h-screen bg-gradient-to-b from-black to-[#1a2a4a]">
      {/* Login Button */}
      {!isAuthenticated && (
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            className="border-white bg-transparent transition-all text-white hover:bg-blue-400 hover:border-blue-400 hover:text-white"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </div>
      )}

      <div className="mb-5 w-20 h-20 rounded-full bg-gray-700 flex justify-center items-center overflow-hidden">
        <img
          src={
            data?.landing_page?.thumbnail ||
            "https://www.shutterstock.com/shutterstock/photos/2278726727/display_1500/stock-vector-minimalistic-circular-logo-sample-vector-2278726727.jpg"
          }
          alt="Logo"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-sm mb-2 text-center text-gray-400">
        {data?.landing_page?.top_heading ||
          `Limited Time ${
            type == "course" ? "Training" : "BluePrint"
          } Reveals:`}
      </div>

      <div className="text-xl font-bold text-center mb-5 text-white">
        {data?.landing_page?.main_heading ? (
          <span>
            {data.landing_page.main_heading.split(" ").map((word, index) => {
              const highlightWords =
                data.landing_page?.highlight_words?.split(",") || [];
              const shouldHighlight = highlightWords.some((hw) =>
                word.toLowerCase().includes(hw.trim().toLowerCase())
              );
              return (
                <span
                  key={index}
                  className={shouldHighlight ? "text-[#00b0ff]" : ""}
                >
                  {word}{" "}
                </span>
              );
            })}
          </span>
        ) : (
          data.title
        )}
      </div>

      <div className="text-lg mb-5 text-center">
        {data?.landing_page?.sub_heading || data.description}
      </div>

      <div className="w-full max-w-sm aspect-video bg-gray-800 mb-5 flex justify-center items-center relative">
        <video
          controls
          className="w-full h-full"
          poster={
            data?.thumbnail ||
            "https://marketplace.canva.com/EAEqfS4X0Xw/1/0/1600w/canva-most-attractive-youtube-thumbnail-wK95f3XNRaM.jpg"
          }
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(true)}
        >
          <source
            src={
              data?.intro_video ||
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
            }
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

      {showBuyButton &&
        (!data.is_purchased ? (
          <button
            onClick={handleBuyNowClick}
            className="bg-[#00b0ff] text-white px-8 py-3 border-none rounded text-lg cursor-pointer mt-5 transition-opacity hover:opacity-90 w-full max-w-sm"
          >
            Buy Now
          </button>
        ) : (
          <button
            onClick={() =>
              navigate(`/${type}/${type === "course" ? "watch" : "read"}/${id}`)
            }
            className="bg-[#00b0ff] text-white px-8 py-3 border-none rounded text-lg cursor-pointer mt-5 transition-opacity hover:opacity-90 w-full max-w-sm"
          >
            Watch now
          </button>
        ))}
    </div>
  );
};

export default Landing;
