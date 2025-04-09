
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PlusCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const [kits, setKits] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const openCreateKitModal = () => {
    setShowCreateModal(true);
    toast({
      title: "Create a new kit",
      description: "Follow the steps to create your fundraising kit"
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-600">Fundraising Kit Creator</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Your Fundraising Kits</h2>
          <Button 
            onClick={openCreateKitModal}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Kit
          </Button>
        </div>

        {kits.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">No Fundraising Kits</CardTitle>
              <CardDescription className="text-gray-500">
                You haven't created any fundraising kits yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-yellow-100 p-6 mb-4">
                  <PlusCircle className="h-10 w-10 text-yellow-500" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Create your first fundraising kit</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Design a dynamic kit with customizable sections for headers, videos, 
                  what to do guides, WhatsApp messages, and social media posts.
                </p>
                <Button 
                  onClick={openCreateKitModal}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kit cards will be rendered here when available */}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">Create New Fundraising Kit</CardTitle>
              <CardDescription className="text-gray-500">
                Follow the steps below to set up your fundraising kit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-500">
                  Your kit will include customizable sections for:
                </p>
                <ul className="list-disc list-inside text-gray-500 space-y-2">
                  <li>Header with mobile and desktop images</li>
                  <li>Video section with YouTube embed</li>
                  <li>What to do steps</li>
                  <li>WhatsApp message templates</li>
                  <li>Social media posts</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Continue
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
