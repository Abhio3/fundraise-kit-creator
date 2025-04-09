
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();

  const handleGetStarted = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the fundraising kit creator.",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-fundraise-blue to-blue-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Fundraising Kit Creator</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Create customizable fundraising kits for your campaigns. Easily manage content, 
              add sections, and share with fundraisers.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to={currentUser ? "/admin" : "/admin"}>
                <Button 
                  size="lg" 
                  className="bg-white text-fundraise-blue hover:bg-fundraise-lightyellow hover:text-black"
                  onClick={handleGetStarted}
                >
                  {currentUser ? "Go to Dashboard" : "Get Started"}
                </Button>
              </Link>
              
              {!currentUser && (
                <Link to="/admin">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-fundraise-blue"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Create Dynamic Fundraising Kits</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                title="Fully Customizable" 
                description="Create dynamic headers, sections, and content tailored to each fundraising campaign."
                icon="✏️"
              />
              <FeatureCard 
                title="Multi-Platform" 
                description="Optimized for both mobile and desktop with responsive design and separate image uploads."
                icon="📱"
              />
              <FeatureCard 
                title="Content Management" 
                description="Easily add YouTube videos, WhatsApp templates, social media posts, and downloadable resources."
                icon="📋"
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-fundraise-lightyellow py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Fundraising?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Create your first fundraising kit today and increase your campaign's effectiveness.
            </p>
            
            <Link to={currentUser ? "/admin" : "/admin"}>
              <Button 
                size="lg" 
                className="bg-fundraise-blue text-white hover:bg-blue-700"
                onClick={handleGetStarted}
              >
                {currentUser ? "Go to Dashboard" : "Get Started Now"}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Fundraising Kit Creator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Index;
