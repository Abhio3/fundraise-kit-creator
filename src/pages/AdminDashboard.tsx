
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Settings, Users, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("kits");
  const { toast } = useToast();

  const handleCreateKit = () => {
    toast({
      title: "Create Kit",
      description: "Starting the kit creation process",
    });
    // Further implementation will come later
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
                onClick={handleCreateKit}
                className="bg-yellow-300 hover:bg-yellow-400 text-black"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Create New Kit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-300 transition-all cursor-pointer">
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
                <p className="text-gray-400">No fundraisers created yet.</p>
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
    </div>
  );
};

export default AdminDashboard;
