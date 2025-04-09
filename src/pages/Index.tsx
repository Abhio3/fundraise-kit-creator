
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { PlusCircle, LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import KitFormModal from "@/components/KitFormModal";
import { Kit, useKits } from "@/hooks/useKits";
import { Link } from "react-router-dom";

const Index = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { useKitsList, useCreateKit, useFundraisersList } = useKits();
  
  const { data: kits = [], isLoading: isLoadingKits } = useKitsList();
  const { data: fundraisers = [], isLoading: isLoadingFundraisers } = useFundraisersList();
  const { mutateAsync: createKit, isPending: isCreatingKit } = useCreateKit();

  const openCreateKitModal = () => {
    setShowCreateModal(true);
    toast({
      title: "Create a new kit",
      description: "Follow the steps to create your fundraising kit"
    });
  };

  const handleCreateKit = async (kitData: Kit) => {
    try {
      await createKit(kitData);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating kit:", error);
      toast({
        title: "Error creating kit",
        description: "There was a problem creating your kit. Please try again.",
        variant: "destructive"
      });
    }
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
            disabled={isCreatingKit}
          >
            {isCreatingKit ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              <><PlusCircle className="mr-2 h-4 w-4" /> Create New Kit</>
            )}
          </Button>
        </div>

        {isLoadingKits ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
          </div>
        ) : kits.length === 0 ? (
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
            {kits.map((kit) => (
              <Card key={kit.id} className="bg-white border-gray-200 hover:border-yellow-300 transition-all shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">{kit.name}</CardTitle>
                  <CardDescription className="text-gray-500">
                    {kit.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {kit.header_desktop_image ? (
                    <img 
                      src={kit.header_desktop_image} 
                      alt={kit.name} 
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x200/yellow/black?text=Fundraising+Kit";
                      }}
                    />
                  ) : (
                    <div className="bg-gray-100 h-32 flex items-center justify-center rounded-md">
                      <p className="text-gray-400">No header image</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-100 pt-4">
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    asChild
                  >
                    <Link to={`/kit/${kit.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <KitFormModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateKit}
          fundraisers={fundraisers}
        />
      )}
    </div>
  );
};

export default Index;
