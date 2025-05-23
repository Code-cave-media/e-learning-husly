import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  BookOpen,
  FileText,
  Download,
  Clock,
  Eye,
  ArrowRight,
  ShoppingCart,
  Link,
} from "lucide-react";
import RegistrationForm from "@/components/shared/RegistrationForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { useAPICall } from "@/hooks/useApiCall";

interface Chapter {
  id: number;
  title: string;
  description: string;
}

interface Feature {
  id: number;
  text: string;
}

interface Ebook {
  id: number;
  type: string;
  title: string;
  description: string;
  number_of_pages: number;
  price: number;
  commission: number;
  content: File | null;
  contentUrl: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  visible: boolean;
  originalPrice: number;
  isPurchased: boolean;
}

const ebookFormats = ["PDF", "EPUB", "MOBI", "PDF, EPUB", "PDF, EPUB, MOBI"];

export default function EbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const affiliateId = searchParams.get("ref");
  const { isAuthenticated, isAdmin } = useAuth();
  const { fetching, makeApiCall } = useAPICall();
  const [ebook, setEbook] = useState<Ebook | null>(null);

  const handlePurchaseSuccess = () => {
    toast.success("Purchase successful!");
    navigate(`/user/dashboard/ebooks/${id}`);
  };

  // Dummy ebook data
  useEffect(() => {
    setEbook({
      id: 1,
      type: "Programming",
      title: "Python Programming Guide",
      description: "A comprehensive guide to Python programming language",
      number_of_pages: 250,
      price: 999,
      commission: 10,
      content: null,
      contentUrl: "https://example.com/ebook.pdf",
      thumbnail: null,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2070&auto=format&fit=crop",
      visible: true,
      originalPrice: 1999,
      isPurchased: false,
    });
  }, [id]);

  if (!ebook) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{ebook.type}</Badge>
                <Badge variant="outline">4.8 ★ (856 reviews)</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{ebook.title}</h1>
              <p className="text-xl text-muted-foreground">
                {ebook.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>{ebook.number_of_pages} pages</span>
                </div>
              </div>
              <div className="flex gap-4">
                {isAdmin ? (
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Eye className="w-5 h-5 mr-2" />
                    View Ebook
                  </Button>
                ) : ebook.isPurchased ? (
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Go to Ebook
                  </Button>
                ) : (
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now
                  </Button>
                )}
                <Button size="lg" variant="outline">
                  <Link className="w-5 h-5 mr-2" />
                  Create Affiliate Link
                </Button>
              </div>
            </div>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <img
                src={ebook.thumbnailUrl}
                alt={ebook.title}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ebook Details */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Ebook Details</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Description</h3>
                      <p className="text-muted-foreground">
                        {ebook.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium">Number of Pages</h3>
                        <p className="text-muted-foreground">
                          {ebook.number_of_pages} pages
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Format</h3>
                        <p className="text-muted-foreground">PDF, EPUB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {!isAuthenticated ? (
                <RegistrationForm
                  type="ebook"
                  itemId={id || ""}
                  price={ebook.price}
                  affiliateId={affiliateId || undefined}
                  onSuccess={handlePurchaseSuccess}
                />
              ) : (
                <Card className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      {formatCurrency(ebook.price)}
                    </h3>
                    <p className="text-muted-foreground line-through">
                      {formatCurrency(ebook.originalPrice)}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {ebook.isPurchased ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => navigate(`/user/dashboard/ebooks/${id}`)}
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Go to Ebook
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => navigate(`/user/dashboard/ebooks/${id}`)}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now
                      </Button>
                    )}
                    <Button className="w-full" variant="outline" size="lg">
                      <Link className="w-5 h-5 mr-2" />
                      Create Affiliate Link
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
