import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  BarChart3,
  Gift,
  ArrowRight,
  BookOpen,
  Video,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AffiliateProgramPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleJoinProgram = () => {
    if (isAuthenticated) {
      navigate("/dashboard/affiliate");
    } else {
      navigate("/login");
    }
  };

  const benefits = [
    {
      title: "High Commission Rates",
      description: "Earn up to 30% commission on every sale you refer",
      icon: DollarSign,
    },
    {
      title: "Sell All Products",
      description: "Promote any course or ebook in our collection",
      icon: Gift,
    },
    {
      title: "Real-time Analytics",
      description: "Track your performance and earnings in real-time",
      icon: BarChart3,
    },
    {
      title: "Dedicated Support",
      description: "Get help from our affiliate support team",
      icon: Users,
    },
  ];

  const requirements = [
    {
      title: "Purchase Required",
      description: "Buy any course or ebook to get started",
      icon: Lock,
    },
    {
      title: "Access to Products",
      description: "You can only access the products you've purchased",
      icon: BookOpen,
    },
    {
      title: "Promote Everything",
      description: "Sell any course or ebook, regardless of what you own",
      icon: Video,
    },
  ];

  const steps = [
    {
      title: "Purchase a Product",
      description: "Buy any course or ebook to get access to the platform",
    },
    {
      title: "Get Affiliate Access",
      description: "Automatically get affiliate access after your purchase",
    },
    {
      title: "Generate Links",
      description: "Create affiliate links for any product in our collection",
    },
    {
      title: "Start Earning",
      description: "Earn commissions on every successful referral",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Become an Affiliate Partner
            </h1>
            <p className="text-xl text-muted-foreground">
              Start earning by promoting our courses and ebooks. Purchase any
              product to get started with our affiliate program.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/courses")}>
                Browse Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/ebooks")}
              >
                Browse Ebooks
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-12">
        <div className="container px-4 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How to Get Started</h2>
            <p className="text-muted-foreground">
              Follow these simple requirements to start your affiliate journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {requirements.map((req, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <req.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {req.title}
                      </h3>
                      <p className="text-muted-foreground">{req.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Become an Affiliate?
            </h2>
            <p className="text-muted-foreground">
              Discover the benefits of joining our affiliate program
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12">
        <div className="container px-4 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Journey to Success</h2>
            <p className="text-muted-foreground">
              Follow these steps to start earning as an affiliate
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge
                      variant="secondary"
                      className="h-8 w-8 flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary/5">
        <div className="container px-4 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground">
              Purchase any course or ebook to get started with our affiliate
              program and start earning commissions.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/courses")}>
                Browse Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/ebooks")}
              >
                Browse Ebooks
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
