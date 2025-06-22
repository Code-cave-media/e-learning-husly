import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useDownloader from "react-use-downloader";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";

interface EBookChapterResponse {
  id: number;
  title: string;
  description: string;
  page_number: number;
  completed: boolean;
}

interface LandingPageResponse {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

interface EBookResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  pdf: string;
  thumbnail: string;
  intro_video: string | null;
  visible: boolean;
  created_at: string;
  updated_at: string;
  commission: number;
  chapters: EBookChapterResponse[];
  landing_page: LandingPageResponse;
  is_featured: boolean;
  is_new: boolean;
}

const EbookViewPage = () => {
  const { ebookId } = useParams();
  const { download } = useDownloader();
  const [error, setError] = useState<string | null>(null);
  const { fetchType, fetching, isFetched, makeApiCall } = useAPICall();
  const { authToken } = useAuth();
  const [ebookData, setEbookData] = useState<EBookResponse | null>(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();

  useEffect(() => {
    const fetchData = async () => {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.GET_EBOOK_READ_PAGE(ebookId),
        null,
        "application/json",
        authToken,
        "getEbookReadPage"
      );
      if (response.status === 200) {
        setEbookData(response.data);
      } else {
        setError("Failed to load ebook data");
      }
    };
    fetchData();
  }, [ebookId]);

  const handleDownload = () => {
    if (ebookData?.pdf) {
      download(ebookData.pdf, `${ebookData.title}.pdf`);
    }
  };

  const handleTocClick = (page: number) => {
    pageNavigationPluginInstance.jumpToPage(page - 1); // PDF pages are 0-based
  };

  if (fetching && fetchType === "getEbookReadPage") {
    return (
      <div className="primary-container px-2 py-4 sm:px-4 sm:py-8">
        <Loading />
      </div>
    );
  }

  if (isFetched && !ebookData) {
    return (
      <div className="primary-container px-2 py-4 sm:px-4 sm:py-8">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-destructive" />
              <h2 className="text-xl sm:text-2xl font-bold">Ebook Not Found</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                This ebook is either not visible or doesn't exist.
              </p>
              <Button
                size="sm"
                className="sm:text-base"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ebookData) {
    return null;
  }

  return (
    <div className="primary-container px-2 py-4 sm:px-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* PDF Viewer Section */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">
                    {ebookData.title}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {ebookData.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={handleDownload}
                >
                  <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Download PDF
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-3 sm:mb-4">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="h-[500px] sm:h-[800px] border rounded-lg">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={ebookData.pdf}
                    plugins={[
                      defaultLayoutPluginInstance,
                      pageNavigationPluginInstance,
                    ]}
                  />
                </Worker>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table of Contents Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Table of Contents
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {ebookData.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleTocClick(chapter.page_number)}
                    className="w-full text-left p-2 sm:p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {chapter.title}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Page {chapter.page_number}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EbookViewPage;
