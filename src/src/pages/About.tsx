
import { motion } from "framer-motion";
import MainLayout from "@/layouts/MainLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-unimart-600 to-unimart-800 bg-clip-text text-transparent">
            About UniMart
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              UniMart is a marketplace created for students by students at PCCE Goa, 
              facilitating the exchange of academic resources and equipment.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p>
              To create a sustainable ecosystem where students can buy and sell academic materials
              they no longer need, saving money and reducing waste while helping fellow students.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Sign up with your college email (@pccegoa.edu.in).</li>
              <li>Browse through listings of textbooks, lab coats, drafting tools, and more.</li>
              <li>Contact sellers directly and arrange exchanges on campus.</li>
              <li>List your own items when you no longer need them.</li>
            </ol>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Blockchain Verification</h2>
            <p>
              UniMart uses blockchain technology to verify transactions and provide a secure, 
              transparent record of all exchanges. This ensures authenticity and builds trust 
              in our marketplace.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Community</h2>
            <p className="mb-6">
              Whether you're looking to save money on textbooks or find a new home for your 
              engineering tools, UniMart is the place for PCCE Goa students to connect and exchange.
            </p>
            
            <div className="mt-8">
              <Link to="/products">
                <Button className="bg-unimart-600 hover:bg-unimart-700">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default About;
