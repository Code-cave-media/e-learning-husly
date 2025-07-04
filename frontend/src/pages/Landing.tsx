import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, LogIn, Play, Pause, ArrowRight } from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { LandingPage } from "@/types/apiTypes";
import toast from "react-hot-toast";
import { Loading } from "@/components/ui/loading";

const latoFont = `@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap');`;
const montserratFont = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900,200,600&display=swap');`;
const clashDisplayFont = `@import url('https://api.fontshare.com/v2/css?f[]=clash-display@700,800,900&display=swap');`;

const Landing = () => {
  const { id, type } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const [timeLeft, setTimeLeft] = useState(10);
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, authToken } = useAuth();
  const { fetchType, fetching, makeApiCall, isFetched } = useAPICall();
  const [data, setData] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        if (response && response.status == 200) {
          const videoDuration = await getVideoDuration(
            response.data.intro_video
          );
          setTimeLeft(parseInt(`${videoDuration as number}`));
          setData(response.data);
        }
      } catch (error) {
        console.log(error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
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

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return { h, m, s };
  };

  const addClickAffiliateLink = async (totalClickedLinks: string[]) => {
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.ADD_CLICK_AFFILIATE_LINK,
      { affiliate_user_id: ref, item_id: id, item_type: type },
      "application/json"
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

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch((err) => console.error("Video play failed:", err));
        if (isMuted) {
          video.muted = false;
          setIsMuted(false);
        }
      } else {
        video.pause();
      }
      setIsPlaying(!video.paused);
    }
  };
  console.log(isLoading);
  if (isLoading) {
    return (
      <div className="flex flex-col items-center bg-black text-white p-5 font-sans min-h-screen bg-gradient-to-b from-black to-[#1a2a4a]">
        <Loading />
      </div>
    );
  }
  console.log(isLoading);
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
              ? "This Training is either not found or not currently available for viewing."
              : "This BluePrint is either not found or not currently available for viewing."}
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
    <>
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        {/* Enhanced Gradient + Texture + Blur background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: "rgb(0, 25, 35)",
            backgroundImage: 'url("/images/bg/ladning-texture.png")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            paddingTop: "10px",
            paddingBottom: "0px",
            outline: "currentcolor",
            filter: "blur(0px)",
          }}
        >
          {/* Dark overlay for a deeper background */}
          <div
            className="absolute inset-0 bg-black opacity-40 pointer-events-none"
            style={{ zIndex: 1 }}
          ></div>
          <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-[#0a7cff]/40 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-[#001a33]/80 rounded-full blur-[100px] animate-pulse"></div>
        </div>
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center mx-auto z-10 max-w-3xl">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex justify-center items-center overflow-hidden">
            <img
              src="https://cdn-icons-png.flaticon.com/512/552/552721.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {!isAuthenticated && (
            <Button
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#15456f] rounded-full px-4 py-1 min-h-0 text-xs flex items-center gap-1 font-semibold shadow-none"
              onClick={() => navigate("/login")}
              style={{ boxShadow: "none" }}
            >
              <LogIn className="h-3 w-3 mr-1" />
              Login
            </Button>
          )}
        </header>

        <main className="flex flex-col items-center pt-24 pb-8 px-4 ">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1 text-sm font-semibold text-blue-300 ring-1 ring-inset ring-blue-500/30 shadow-lg mt-5 border border-blue-400 max-sm:text-[0.65rem]"
            style={{
              fontFamily: "MontserratB, Montserrat, Arial, sans-serif",
              fontWeight: 700,
              boxShadow: "0 0 16px 4px #0a7cff55, 0 0 32px 8px #0a7cff33",
            }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            {data?.landing_page?.top_heading ||
              `Limited Time ${
                type == "course" ? "Training" : "BluePrint"
              } Reveals:`}
          </div>
          <h1
            style={{
              fontFamily: "'Super Comic', sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.3px",
              lineHeight: 1.01,
            }}
            className="text-white text-4xl md:text-6xl text-center mb-4 max-w-3xl mt-4 drop-shadow-lg max-sm:text-[1.3rem]"
          >
            {data?.landing_page?.main_heading ? (
              <span>
                {data.landing_page.main_heading
                  .split(" ")
                  .map((word, index) => {
                    const highlightWords =
                      data.landing_page?.highlight_words?.split(",") || [];
                    const shouldHighlight = highlightWords.some((hw) =>
                      word.toLowerCase().includes(hw.trim().toLowerCase())
                    );
                    return (
                      <span
                        key={index}
                        className={
                          shouldHighlight ? "font-black gradient-highlight" : ""
                        }
                        style={
                          shouldHighlight
                            ? {
                                background:
                                  "linear-gradient(90deg,#5794f7,#0081fa)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                color: "transparent",
                              }
                            : {}
                        }
                      >
                        {word}{" "}
                      </span>
                    );
                  })}
              </span>
            ) : (
              <span className="text-white font-black">{data.title}</span>
            )}
          </h1>

          <p
            className="text-lg text-white mb-6 text-center max-w-2xl  drop-shadow max-sm:text-xs"
            style={{
              fontFamily: "MontserratB, Montserrat, Arial, sans-serif",
              fontWeight: 400,
            }}
          >
            {data?.landing_page?.sub_heading || data.description}
          </p>

          <div
            className="w-full max-w-3xl aspect-video bg-black mb-6 relative rounded-2xl overflow-hidden border-white border-2 shadow-2xl"
            style={{
              boxShadow: "0 0 10px 2px #0a7cff55, 0 0 32px 8px #0a7cff55",
            }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster={data?.landing_page?.thumbnail}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setShowBuyButton(true)}
              muted={isMuted}
              playsInline
              onClick={togglePlay}
              onContextMenu={(e) => e.preventDefault()}
              disablePictureInPicture
              src={
                data?.intro_video ||
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
              }
            >
              Your browser does not support the video tag.
            </video>

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 cursor-pointer ${
                isPlaying
                  ? "opacity-0 hover:opacity-100 hover:bg-black/50"
                  : "opacity-100 bg-black/50"
              }`}
              onClick={togglePlay}
            >
              {/* {isMuted && !isPlaying && (
                <div
                  className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const video = videoRef.current;
                    if (video) {
                      video.muted = false;
                      setIsMuted(false);
                    }
                  }}
                ></div>
              )} */}
              <button className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                {isPlaying ? (
                  <Pause className="h-12 w-12 text-white" />
                ) : (
                  <Play className="h-12 w-12 text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="w-full max-w-md text-center min-h-[120px] grid place-items-center">
            <div
              className={`transition-all duration-500 ease-in-out ${
                showBuyButton ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <div className="flex justify-center items-center gap-x-6 md:gap-x-8 mb-5">
                {Object.entries(formatTime(timeLeft)).map(
                  ([unit, value], idx, arr) => (
                    <React.Fragment key={unit}>
                      <div className="flex flex-col items-center">
                        <div
                          className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border-4 border-white font-bold text-base"
                          style={{
                            background: "#000",
                            boxShadow:
                              "0 0 8px 2px #1880ff55, 0 0 16px 4px #1880ff55",
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "#fff",
                            fontFamily: "Montserrat, Arial, sans-serif",
                          }}
                        >
                          {value}
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 font-semibold">
                          {unit === "h"
                            ? "Hours"
                            : unit === "m"
                            ? "Minutes"
                            : "Seconds"}
                        </span>
                      </div>
                      {/* Add blue colon except after last item */}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
            {!data.is_purchased && showBuyButton ? (
              <button
                onClick={handleBuyNowClick}
                className={`
                  absolute
                  bg-gradient-to-b from-[#18c8ff] to-[#0066ff]
                  text-black
                  font-bold
                  px-6 py-2
                  rounded-2xl
                  text-lg
                  shadow-lg
                  hover:from-[#00b0ff] hover:to-[#003366]
                  transition-all
                  duration-300
                  max-w-xs
                  flex items-center justify-center
                  animate-bounce-slow
                  border-none
                  z-10
                  w-[170px]
                `}
                style={{
                  boxShadow: "0 0 16px 4px #0a7cff55, 0 0 32px 8px #0a7cff33",
                  fontFamily: "Lato, sans-serif",
                }}
              >
                <span className="mr-2 mb-2 text-2xl font-black text-white leading-none">
                  ›
                </span>
                <span
                  className="text-lg font-bold text-white"
                  style={{ lineHeight: 1 }}
                >
                  Get Started
                </span>
              </button>
            ) : null}
          </div>
        </main>

        <footer className="bg-transparent text-gray-400 py-8 pt-0 px-4 text-center text-xs">
          <div className="max-w-4xl mx-auto space-y-4 pt-8">
            <div className="flex justify-center gap-4 font-bold">
              <Link to="/terms" className="text-blue-400 hover:underline">
                Terms Of Services
              </Link>
              <Link
                to="/refund-policy"
                className="text-blue-400 hover:underline"
              >
                Refund Policy
              </Link>
              <Link to="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </div>
            <p>
              <span className="font-bold text-gray-200">Support Email:</span>{" "}
              officialeternalservices@gmail.com
            </p>
            <p className="font-bold text-gray-200">
              Copyright {new Date().getFullYear()} - @Husly2.0
            </p>
            <div className="text-gray-500 space-y-3 text-justify">
              <p>
                "These earnings are not representative of the average
                participant's. The average participant will earn significantly
                less or no money at all through this product or service."
              </p>
              <p>
                This site is not part of the Facebook or Instagram website or
                Facebook Inc. Additionally, this site is NOT endorsed by
                Facebook or Instagram in any way. Facebook is a trademark of
                FACEBOOK, Inc.
              </p>
              <p>
                Earnings Disclaimer: Results may vary and testimonials are not
                claimed to represent typical results. All testimonials are real.
                These results are meant as a showcase of what the best, most
                motivated and driven clients have done and should not be taken
                as average or typical results. You should perform your own due
                diligence and use your own best judgment prior to making any
                investment decision pertaining to your business. By virtue of
                visiting this site or interacting with any portion of this site,
                you agree that you're fully responsible for the investments you
                make and any outcomes that may result.
              </p>
              <p>
                DISCLAIMER: The sales figures stated above are our personal
                sales figures. Please understand my results are not typical, I'm
                not implying you'll duplicate them (or do anything for that
                matter). I have the benefit of practicing sales, marketing and
                advertising for 2 years, and have an established following as a
                result. The average person who buys any "how to" information
                gets little to no results. I'm using these references for
                example purposes only. Your results will vary and depend on many
                factors ...including but not limited to your background,
                experience, and work ethic. All business entails risk as well as
                massive and consistent effort and action. If you're not willing
                to accept that, please DO NOT GET THIS PRODUCT.
              </p>
            </div>
          </div>
        </footer>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        ${montserratFont}
        ${clashDisplayFont}
        @font-face {
          font-family: 'Phonk Contrast';
          src: url('/font/Phonk-ContrastDEMO.otf') format('opentype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Jumper Black';
          src: url('/font/JumperPERSONALUSEONLY-Black.ttf') format('truetype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Super Comic';
          src: url('/font/Super_Comic.otf') format('opentype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Code Next Black';
          src: url('/font/CodeNext-Trial-Black.ttf') format('truetype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Objectivity Black';
          src: url('/font/Objectivity-Black.otf') format('opentype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    </>
  );
};

export default Landing;
