import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link as LinkIcon } from "lucide-react";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  is_new?: boolean;
  is_featured?: boolean;
  is_purchased?: boolean;
  isHomePage?: boolean;
  type?: "course" | "ebook";
  has_affiliate_link?: boolean;
  affiliate_user_id?: string; // Optional prop for affiliate user ID
}

const CourseCard = ({
  id,
  title,
  description,
  price,
  thumbnail,
  is_new = false,
  is_featured = false,
  is_purchased = false,
  isHomePage = false,
  has_affiliate_link = false,
  affiliate_user_id = "",
}: CourseCardProps) => {
  const { isAuthenticated, user, authToken } = useAuth();
  const [affiliateLink, setAffiliateLink] = React.useState("");
  const [showCopied, setShowCopied] = React.useState(false);
  const { fetchType, fetching, makeApiCall } = useAPICall();
  useEffect(() => {
    if (has_affiliate_link) {
      const link = `${window.location.origin}/landing/course/${id}?ref=${user?.user_id}`;
      setAffiliateLink(link);
    }
  }, [has_affiliate_link]);
  const createAffiliateLink = async () => {
    if (has_affiliate_link == false) {
      const response = await makeApiCall(
        "POST",
        API_ENDPOINT.CREATE_AFFILIATE_LINK,
        {
          item_id: id,
          item_type: "course",
        },
        "application/json",
        authToken,
        "createAffiliateLink"
      );
      if (response.status !== 200) {
        toast.error("Error generating affiliate link!");
        return;
      }
    }
    const link = `${window.location.origin}/landing/course/${id}?ref=${user?.user_id}`;
    setAffiliateLink(link);
    toast.success("Affiliate link generated successfully!");
  };

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className=" aspect-video object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-wrap gap-2">
          {is_new && <span className="tag-new">New</span>}
          {is_featured && <span className="tag-featured">Featured</span>}
        </div>
        {isAuthenticated && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute bottom-2 right-2 p-2 bg-gray-100 rounded-full hover:bg-white transition-colors">
                <LinkIcon className="w-4 h-4 text-gray-600" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Affiliate Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-500">
                  Share this course with your audience and earn 30% commission
                  on each sale.
                </p>
                {affiliateLink ? (
                  <div className="flex items-center space-x-2">
                    <Input value={affiliateLink} readOnly />
                    <Button
                      loading={fetching && fetchType === "createAffiliateLink"}
                      size="sm"
                      onClick={copyAffiliateLink}
                    >
                      {showCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={createAffiliateLink}>Generate Link</Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <CardContent className="flex-grow pt-4 max-sm:p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{description}</p>
        {!isHomePage && (
          <p className="font-bold text-brand-primary">₹{price.toFixed(2)}</p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-0 pb-4 max-sm:px-4">
        {isAuthenticated && !isHomePage && (
          <>
            {is_purchased ? (
              <Button asChild className="w-full">
                <Link to={`/course/watch/${id}`}>Watch Now</Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link to={`/landing/course/${id}`}>Buy</Link>
              </Button>
            )}
          </>
        )}

        {isHomePage && (
          <Button asChild className="w-full">
            <Link to={`/landing/course/${id}?ref=${affiliate_user_id}`}>
              Start your side hustle
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
