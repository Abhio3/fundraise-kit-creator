
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Settings, Users, Folder, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useKits } from "@/hooks/useKits";
import { useAuth } from "@/components/AuthProvider";
import KitFormModal from "@/components/KitFormModal";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("kits");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const { useKitsList, useCreateKit, useFundraisersList } = useKits();
  const { user } = useAuth();
  
  const { data: kits = [], isLoading: isLoadingKits } = useKitsList();
  const { data: fundraisers = [], isLoading: isLoadingFundraisers } = useFundraisersList();
  const { mutateAsync: createKit, isPending: isCreatingKit } = useCreateKit();

  const handleCreateKit = async (kitData: any) => {
    try {
      await createKit(kitData);
      setShowCreateModal(false);
      toast({
        title: "Kit Created",
        description: "Your fundraising kit has been created successfully."
      });
    } catch (error) {
      console.error("Error creating kit:", error);
      toast({
        title: "Error",
        description: "There was an error creating your kit.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="py-4 px-6 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-yellow-200">Fundraising Kit Admin</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800">
              View User Dashboard
            </Button>
          </Link>
          <Button className="bg-yellow-300 hover:bg-yellow-400 text-black">
            <Settings className="h-4 w-4 mr-2" /> Account
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="kits" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-gray-900">
            <TabsTrigger value="kits" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black">
              Kits
            </TabsTrigger>
            <TabsTrigger value="fundraisers" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black">
              Fundraisers
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black">
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kits">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Fundraising Kits</h2>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-yellow-300 hover:bg-yellow-400 text-black"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Create New Kit
              </Button>
            </div>

            {isLoadingKits ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-yellow-300" />
              </div>
            ) : kits.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-300 transition-all cursor-pointer" onClick={() => setShowCreateModal(true)}>
                <CardHeader>
                  <CardTitle>Create New Kit</CardTitle>
                  <CardDescription className="text-gray-400">
                    Set up a new fundraising kit
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <PlusCircle className="h-16 w-16 text-yellow-300" />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kits.map((kit) => (
                  <Card key={kit.id} className="bg-gray-900 border-gray-800 hover:border-yellow-300 transition-all">
                    <CardHeader>
                      <CardTitle>{kit.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {kit.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {kit.header_desktop_image ? (
                        <img 
                          src={kit.header_desktop_image} 
                          alt={kit.name} 
                          className="w-full h-32 object-cover rounded-md mb-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x200/yellow/black?text=Fundraising+Kit";
                          }}
                        />
                      ) : (
                        <div className="bg-gray-800 h-32 flex items-center justify-center rounded-md mb-4">
                          <p className="text-gray-500">No header image</p>
                        </div>
                      )}
                      <div className="flex justify-between mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-gray-700 hover:bg-gray-800 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-gray-700 hover:bg-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Card className="bg-gray-900 border-gray-800 hover:border-yellow-300 transition-all cursor-pointer" onClick={() => setShowCreateModal(true)}>
                  <CardHeader>
                    <CardTitle>Create New Kit</CardTitle>
                    <CardDescription className="text-gray-400">
                      Set up a new fundraising kit
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-8">
                    <PlusCircle className="h-16 w-16 text-yellow-300" />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="fundraisers">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Fundraisers</h2>
              <Button className="bg-yellow-300 hover:bg-yellow-400 text-black">
                <Users className="h-4 w-4 mr-2" /> Add Fundraiser
              </Button>
            </div>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Fundraiser Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your fundraisers and assign kits to them
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFundraisers ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-300" />
                  </div>
                ) : fundraisers.length === 0 ? (
                  <p className="text-gray-400">No fundraisers created yet.</p>
                ) : (
                  <div className="space-y-4">
                    {fundraisers.map(fundraiser => (
                      <div key={fundraiser.id} className="p-4 border border-gray-800 rounded-md flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium">{fundraiser.name}</h3>
                          <p className="text-gray-400 text-sm">{fundraiser.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-red-900">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Analytics</h2>
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                <Folder className="h-4 w-4 mr-2" /> Export Reports
              </Button>
            </div>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Kit Performance</CardTitle>
                <CardDescription className="text-gray-400">
                  Analytics and performance metrics for your fundraising kits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">No analytics data available yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
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

export default AdminDashboard;
