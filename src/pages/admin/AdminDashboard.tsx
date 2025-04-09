
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/Navbar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { FundraisingKit } from "@/types/models";
import { Plus, Edit, Trash, Loader2 } from "lucide-react";
import { kitService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [kits, setKits] = useState<FundraisingKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteKitId, setDeleteKitId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadKits = async () => {
      try {
        const data = await kitService.getKits();
        setKits(data);
      } catch (error) {
        console.error("Error loading kits:", error);
        toast({
          title: "Error",
          description: "Failed to load fundraising kits",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadKits();
  }, [toast]);

  const handleDeleteKit = async () => {
    if (!deleteKitId) return;
    
    try {
      await kitService.deleteKit(deleteKitId);
      setKits(kits.filter(kit => kit.id !== deleteKitId));
      toast({
        title: "Success",
        description: "Fundraising kit deleted successfully",
      });
      setDeleteKitId(null);
    } catch (error) {
      console.error("Error deleting kit:", error);
      toast({
        title: "Error",
        description: "Failed to delete fundraising kit",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Fundraising Kits</h1>
          
          <Link to="/admin/create-kit">
            <Button className="bg-fundraise-blue hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create New Kit
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-fundraise-blue" />
          </div>
        ) : kits.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-4 text-5xl">📋</div>
              <h3 className="text-xl font-semibold mb-2">No Fundraising Kits Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first fundraising kit to get started.
              </p>
              <Link to="/admin/create-kit">
                <Button className="bg-fundraise-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create a Kit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kits.map((kit) => (
              <Card key={kit.id} className="overflow-hidden">
                <div 
                  className="h-40 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: `url(${kit.headerSection.desktopImageUrl || '/placeholder.svg'})` 
                  }}
                />
                <CardHeader>
                  <CardTitle>{kit.name}</CardTitle>
                  <CardDescription>
                    Created: {new Date(kit.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Link to={`/admin/edit-kit/${kit.id}`}>
                    <Button variant="outline" className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link to={`/kit/${kit.id}`}>
                      <Button variant="ghost">View</Button>
                    </Link>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          onClick={() => setDeleteKitId(kit.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription>
                            This will permanently delete the fundraising kit "{kit.name}". This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setDeleteKitId(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteKit}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
