import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container px-4 mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-brand-primary">
            <img
              src="/images/logo/logo.png"
              alt="Hustly Logo"
              className="h-10 max-sm:h-7 w-auto "
            />
          </span>
        </Link>

        {/* Auth Button for all screens */}
        <div className="flex items-center">
          <Button
            variant="default"
            className="bg-primary text-white hover:bg-blue-700"
            asChild
          >
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
