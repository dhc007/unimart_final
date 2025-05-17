
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BlockchainStatus = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate blockchain verification
  useEffect(() => {
    const checkVerification = () => {
      // Get from local storage or default to false
      const status = localStorage.getItem("blockchain_verified") === "true";
      setIsVerified(status);
    };

    checkVerification();
  }, []);

  // Toggle verification status
  const toggleVerification = () => {
    setIsLoading(true);
    
    // Simulate blockchain verification process
    setTimeout(() => {
      const newStatus = !isVerified;
      setIsVerified(newStatus);
      localStorage.setItem("blockchain_verified", String(newStatus));
      setIsLoading(false);
      
      // Show toast notification
      if (newStatus) {
        toast({
          title: "Blockchain verification activated",
          description: "You'll now see verified badges on eligible items",
          variant: "default",
        });
      } else {
        toast({
          title: "Blockchain verification deactivated",
          description: "Verified badges will no longer be shown",
          variant: "destructive",
        });
      }
      
      // Show recent activity notification
      setTimeout(() => {
        toast({
          title: "Recent blockchain activity",
          description: newStatus 
            ? "Transaction #BD7829 verified student credentials"
            : "Transaction #BD7835 removed verification", 
          variant: "default",
        });
      }, 3000);
    }, 1500);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={toggleVerification}
              disabled={isLoading}
              variant="ghost" 
              size="icon"
              className={`relative ${isVerified ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-b-transparent animate-spin" />
              ) : (
                isVerified ? <Shield className="h-[1.2rem] w-[1.2rem]" /> : <AlertCircle className="h-[1.2rem] w-[1.2rem]" />
              )}
              
              {isVerified && (
                <motion.span 
                  className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isVerified ? 'Blockchain verification active' : 'Blockchain verification inactive'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockchainStatus;