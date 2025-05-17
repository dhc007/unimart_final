
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import AIChat from "@/components/AIChat";
import { motion } from "framer-motion";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      <AIChat />
    </div>
  );
};

export default MainLayout;
