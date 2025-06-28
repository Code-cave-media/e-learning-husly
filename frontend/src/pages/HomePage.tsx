import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/shared/CourseCard";
import EbookCard from "@/components/shared/EbookCard";

// Mock data
const featuredCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more with practical projects.",
    price: 49.99,
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=800",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Advanced React & Redux",
    description:
      "Master React hooks, context API, Redux and build professional applications.",
    price: 59.99,
    thumbnail:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&w=800",
    isNew: true,
  },
  {
    id: "3",
    title: "Python Data Science Masterclass",
    description:
      "Learn Python for data analysis, visualization, machine learning and more.",
    price: 69.99,
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&w=800",
  },
];

const featuredEbooks = [
  {
    id: "1",
    title: "React Patterns & Best Practices",
    description: "Practical guide to writing maintainable React applications.",
    price: 19.99,
    thumbnail:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&w=800",
    isFeatured: true,
  },
  {
    id: "2",
    title: "The Complete Guide to JavaScript",
    description:
      "Master modern JavaScript from fundamentals to advanced topics.",
    price: 24.99,
    thumbnail:
      "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&w=800",
    isNew: true,
  },
];

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-primary to-brand-secondary text-black">
        <div className="container px-4 mx-auto  py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-8 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Expand Your Knowledge with Expert Courses
            </h1>
            <p className="text-lg mb-6 opacity-90">
              Access high-quality video courses and eBooks on a wide range of
              topics. Learn at your own pace and earn through our affiliate
              program.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                asChild
                className="bg-primary  text-white   hover:bg-blue-700"
              >
                <Link to="/learning">Start your side hustle</Link>
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white text-white hover:bg-white/10"
              >
                <Link to="/register">Create Account</Link>
              </Button> */}
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&w=800"
                alt="Learning platform preview"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-brand-primary"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding ">
        <div className="container  px-4  mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured</h2>
            <Button variant="outline" asChild>
              <Link to="/learning">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} isHomePage={true} />
            ))}
            {featuredEbooks.map((ebook) => (
              <EbookCard key={ebook.id} {...ebook} isHomePage={true} />
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      {/* <section className="section-padding bg-brand-primary text-black">
        <div className="container px-4  mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Become an Affiliate Partner
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Earn commission by promoting our high-quality courses and eBooks.
            Join our affiliate program and start generating passive income
            today.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-white text-brand-primary hover:bg-gray-100"
          >
            <Link to="/affiliate-program">Join Affiliate Program</Link>
          </Button>
        </div>
      </section> */}
    </>
  );
};

export default HomePage;
