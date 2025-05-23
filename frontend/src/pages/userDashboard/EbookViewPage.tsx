import { useState } from "react";
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

// Mock data - In a real app, this would come from an API
const ebookData = {
  id: "1",
  title: "Local PDF Document",
  author: "Your Organization",
  pdfUrl: "/pdfs/book.pdf",
  totalPages: 8,
  tableOfContents: [
    { title: "Introduction", page: 1 },
    { title: "Chapter 1", page: 2 },
    { title: "Chapter 2", page: 3 },
    { title: "Chapter 3", page: 4 },
    { title: "Chapter 4", page: 5 },
    { title: "Chapter 5", page: 6 },
    { title: "Chapter 6", page: 7 },
    { title: "Chapter 7", page: 8 },
  ],
};

const EbookViewPage = () => {
  const { ebookId } = useParams();
  const { download } = useDownloader();
  const [error, setError] = useState<string | null>(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();

  const handleDownload = () => {
    download(ebookData.pdfUrl, "ebook.pdf");
  };

  const handleTocClick = (page: number) => {
    pageNavigationPluginInstance.jumpToPage(page - 1); // PDF pages are 0-based
  };

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PDF Viewer Section */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{ebookData.title}</h2>
                  <p className="text-muted-foreground">By {ebookData.author}</p>
                </div>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                    <br />
                    <p className="mt-2 text-sm">
                      Please ensure that:
                      <ul className="list-disc list-inside mt-1">
                        <li>
                          The PDF file exists in the public/pdfs directory
                        </li>
                        <li>The file name matches exactly: book.pdf</li>
                        <li>The file is a valid PDF document</li>
                      </ul>
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-destructive"
                      onClick={() => window.location.reload()}
                    >
                      Click here to retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="h-[800px] border rounded-lg">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={ebookData.pdfUrl}
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
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
              <div className="space-y-2">
                {ebookData.tableOfContents.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleTocClick(item.page)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Page {item.page}
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
