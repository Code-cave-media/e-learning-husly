import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation, useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const {pathname} = useLocation()
  const [isChecked,setIsChecked] = useState(false)
  useEffect(() => {
    if (pathname == '/'){
      navigate("/login");
      setIsChecked(true)
    }else{
      setIsChecked(true)
    }
  }, []);
  if(!isChecked){
    return null
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
