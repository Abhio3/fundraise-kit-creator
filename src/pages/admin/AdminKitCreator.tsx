
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { FundraisingKit, HeaderSection, Section, SectionItem, VideoSection } from "@/types/models";
import { kitService, fundraiserService, fileService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Save, Plus, Trash, Upload, ArrowLeft } from "lucide-react";

const AdminKitCreator = () => {
  const { kitId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("header");
  
  const [kitName, setKitName] = useState("");
  const [fundraiserId, setFundraiserId] = useState("");
  const [fundraisers, setFundraisers] = useState<{ id: string; name: string }[]>([]);
  
  const [headerSection, setHeaderSection] = useState<HeaderSection>({
    title: "Change the Future",
    subtitle: "",
    desktopImageUrl: "/placeholder.svg",
    mobileImageUrl: "/placeholder.svg",
  });

  const [videoSection, setVideoSection] = useState<VideoSection>({
    title: "Fundraising Orientation Recording",
    subtitle: "",
    description: "",
    youtubeVideoId: "",
    buttonText: "Watch video",
  });

  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const loadFundraisers = async () => {
      try {
        const data = await fundraiserService.getFundraisers();
        setFundraisers(data.map(f => ({ id: f.id, name: f.name })));
        
        if (data.length > 0 && !fundraiserId) {
          setFundraiserId(data[0].id);
        }
      } catch (error) {
        console.error("Error loading fundraisers:", error);
      }
    };

    const loadKit = async () => {
      if (!kitId) return;
      
      try {
        setIsLoading(true);
        const kit = await kitService.getKitById(kitId);
        
        if (kit) {
          setKitName(kit.name);
          setFundraiserId(kit.fundraiserId);
          setHeaderSection(kit.headerSection);
          setVideoSection(kit.videoSection || {
            title: "Fundraising Orientation Recording",
            youtubeVideoId: "",
            buttonText: "Watch video",
          });
          setSections(kit.sections || []);
        }
      } catch (error) {
        console.error("Error loading kit:", error);
        toast({
          title: "Error",
          description: "Failed to load kit data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFundraisers();
    loadKit();
  }, [kitId, toast]);

  const handleSave = async () => {
    if (!kitName) {
      toast({
        title: "Validation Error",
        description: "Please enter a kit name",
        variant: "destructive",
      });
      return;
    }

    if (!fundraiserId) {
      toast({
        title: "Validation Error",
        description: "Please select a fundraiser",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const kitData: Partial<FundraisingKit> = {
        name: kitName,
        fundraiserId,
        headerSection,
        videoSection: videoSection.youtubeVideoId ? videoSection : undefined,
        sections,
      };
      
      if (kitId) {
        await kitService.updateKit(kitId, kitData);
        toast({
          title: "Success",
          description: "Fundraising kit updated successfully",
        });
      } else {
        await kitService.createKit(kitData);
        toast({
          title: "Success",
          description: "New fundraising kit created",
        });
      }
      navigate("/admin");
    } catch (error) {
      console.error("Error saving kit:", error);
      toast({
        title: "Error",
        description: "Failed to save kit",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, section?: string, sectionIndex?: number, itemIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: "Uploading...",
        description: "Please wait while your file is being uploaded",
      });
      
      // In a real implementation, this would upload to Supabase storage
      const url = await fileService.uploadFile(file, "fundraising-kits");
      
      // Update the correct field based on parameters
      if (section === "header") {
        setHeaderSection({
          ...headerSection,
          [field]: url,
        });
      } else if (section === "sections" && typeof sectionIndex === "number") {
        const updatedSections = [...sections];
        
        if (typeof itemIndex === "number") {
          // Update a section item field
          updatedSections[sectionIndex].items[itemIndex] = {
            ...updatedSections[sectionIndex].items[itemIndex],
            [field]: url,
          };
        } else {
          // Update a section field
          updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            [field]: url,
          };
        }
        
        setSections(updatedSections);
      }
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const addSection = (type: "steps" | "links" | "whatsapp" | "social" | "info") => {
    const newSection: Section = {
      id: uuidv4(),
      title: getDefaultTitleForSectionType(type),
      type,
      items: getDefaultItemsForSectionType(type),
    };
    
    setSections([...sections, newSection]);
    setActiveTab(`section-${sections.length}`);
  };

  const getDefaultTitleForSectionType = (type: string): string => {
    switch (type) {
      case "steps": return "Getting Started";
      case "links": return "Useful Resources";
      case "whatsapp": return "WhatsApp Templates";
      case "social": return "Social Media Posts";
      case "info": return "Important Information";
      default: return "New Section";
    }
  };

  const getDefaultItemsForSectionType = (type: string): SectionItem[] => {
    switch (type) {
      case "steps":
        return [
          { id: uuidv4(), title: "Step 1", description: "Description for step 1" },
          { id: uuidv4(), title: "Step 2", description: "Description for step 2" },
        ];
      case "links":
        return [
          { id: uuidv4(), title: "Resource 1", linkUrl: "#", linkText: "Click here" },
        ];
      case "whatsapp":
        return [
          { id: uuidv4(), title: "Template 1", content: "Hello, I wanted to reach out about..." },
        ];
      case "social":
        return [
          { id: uuidv4(), title: "Post 1", imageUrl: "/placeholder.svg", description: "Description for post 1" },
        ];
      default:
        return [{ id: uuidv4(), title: "New Item" }];
    }
  };

  const addSectionItem = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const newItem: SectionItem = {
      id: uuidv4(),
      title: `New ${section.type === "steps" ? "Step" : "Item"}`,
    };
    
    const updatedSections = [...sections];
    updatedSections[sectionIndex].items.push(newItem);
    setSections(updatedSections);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
    };
    setSections(updatedSections);
  };

  const updateSectionItem = (sectionIndex: number, itemIndex: number, field: string, value: any) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].items[itemIndex] = {
      ...updatedSections[sectionIndex].items[itemIndex],
      [field]: value,
    };
    setSections(updatedSections);
  };

  const removeSection = (index: number) => {
    const updatedSections = [...sections];
    updatedSections.splice(index, 1);
    setSections(updatedSections);
    setActiveTab("header");
  };

  const removeSectionItem = (sectionIndex: number, itemIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].items.splice(itemIndex, 1);
    setSections(updatedSections);
  };

  if (!currentUser) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <h1 className="text-2xl font-bold">
              {kitId ? "Edit Kit" : "Create New Kit"}
            </h1>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-fundraise-blue hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Kit
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Basic Kit Details */}
          <Card className="lg:col-span-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="kitName">Kit Name</Label>
                <Input
                  id="kitName"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  placeholder="Enter kit name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="fundraiser">Assign to Fundraiser</Label>
                <Select 
                  value={fundraiserId} 
                  onValueChange={setFundraiserId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a fundraiser" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundraisers.map((fundraiser) => (
                      <SelectItem key={fundraiser.id} value={fundraiser.id}>
                        {fundraiser.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-fundraise-blue text-white font-medium">
                Kit Sections
              </div>
              
              <div className="p-4 flex flex-col gap-2">
                <Button 
                  variant={activeTab === "header" ? "default" : "ghost"} 
                  className="justify-start"
                  onClick={() => setActiveTab("header")}
                >
                  Header Section
                </Button>
                
                <Button 
                  variant={activeTab === "video" ? "default" : "ghost"} 
                  className="justify-start"
                  onClick={() => setActiveTab("video")}
                >
                  Video Section
                </Button>
                
                {sections.map((section, index) => (
                  <Button 
                    key={section.id} 
                    variant={activeTab === `section-${index}` ? "default" : "ghost"} 
                    className="justify-start"
                    onClick={() => setActiveTab(`section-${index}`)}
                  >
                    {section.title}
                  </Button>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="font-medium mb-3">Add New Section</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("steps")}
                  >
                    Steps
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("links")}
                  >
                    Links
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("whatsapp")}
                  >
                    WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("social")}
                  >
                    Social
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("info")}
                    className="col-span-2"
                  >
                    Info Section
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Section Editor */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {activeTab === "header" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Header Section</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="headerTitle">Header Title</Label>
                      <Input
                        id="headerTitle"
                        value={headerSection.title}
                        onChange={(e) => setHeaderSection({...headerSection, title: e.target.value})}
                        placeholder="Enter header title"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="headerSubtitle">Header Subtitle (optional)</Label>
                      <Input
                        id="headerSubtitle"
                        value={headerSection.subtitle || ""}
                        onChange={(e) => setHeaderSection({...headerSection, subtitle: e.target.value})}
                        placeholder="Enter header subtitle"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="desktopImage">Desktop Header Image</Label>
                      <div className="mt-1 flex flex-col gap-2">
                        <div className="h-40 bg-gray-100 border rounded flex items-center justify-center overflow-hidden">
                          {headerSection.desktopImageUrl && (
                            <img 
                              src={headerSection.desktopImageUrl} 
                              alt="Desktop header preview" 
                              className="max-h-full object-cover" 
                            />
                          )}
                        </div>
                        <Input
                          id="desktopImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "desktopImageUrl", "header")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="mobileImage">Mobile Header Image</Label>
                      <div className="mt-1 flex flex-col gap-2">
                        <div className="h-40 bg-gray-100 border rounded flex items-center justify-center overflow-hidden">
                          {headerSection.mobileImageUrl && (
                            <img 
                              src={headerSection.mobileImageUrl} 
                              alt="Mobile header preview" 
                              className="max-h-full object-cover" 
                            />
                          )}
                        </div>
                        <Input
                          id="mobileImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "mobileImageUrl", "header")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "video" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Video Section</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="videoTitle">Video Title</Label>
                      <Input
                        id="videoTitle"
                        value={videoSection.title}
                        onChange={(e) => setVideoSection({...videoSection, title: e.target.value})}
                        placeholder="Enter video section title"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="videoButtonText">Button Text</Label>
                      <Input
                        id="videoButtonText"
                        value={videoSection.buttonText}
                        onChange={(e) => setVideoSection({...videoSection, buttonText: e.target.value})}
                        placeholder="Watch video"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="videoId">YouTube Video ID</Label>
                    <Input
                      id="videoId"
                      value={videoSection.youtubeVideoId}
                      onChange={(e) => setVideoSection({...videoSection, youtubeVideoId: e.target.value})}
                      placeholder="e.g. dQw4w9WgXcQ"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter the YouTube video ID (the part after v= in the URL)
                    </p>
                  </div>
                </div>
              )}

              {activeTab.startsWith("section-") && (() => {
                const sectionIndex = parseInt(activeTab.split("-")[1]);
                const section = sections[sectionIndex];
                
                if (!section) return null;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Edit Section</h2>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeSection(sectionIndex)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Remove Section
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 mb-6">
                      <div>
                        <Label htmlFor="sectionTitle">Section Title</Label>
                        <Input
                          id="sectionTitle"
                          value={section.title}
                          onChange={(e) => updateSection(sectionIndex, "title", e.target.value)}
                          placeholder="Enter section title"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <Label>Section Items</Label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => addSectionItem(sectionIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </div>
                      
                      {section.items.map((item, itemIndex) => (
                        <Card key={item.id} className="mb-4 p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">
                              Item {itemIndex + 1}
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeSectionItem(sectionIndex, itemIndex)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor={`item-${itemIndex}-title`}>Title</Label>
                              <Input
                                id={`item-${itemIndex}-title`}
                                value={item.title}
                                onChange={(e) => updateSectionItem(sectionIndex, itemIndex, "title", e.target.value)}
                                placeholder="Enter item title"
                                className="mt-1"
                              />
                            </div>
                            
                            {(section.type === "steps" || section.type === "info") && (
                              <div>
                                <Label htmlFor={`item-${itemIndex}-description`}>Description</Label>
                                <Textarea
                                  id={`item-${itemIndex}-description`}
                                  value={item.description || ""}
                                  onChange={(e) => updateSectionItem(sectionIndex, itemIndex, "description", e.target.value)}
                                  placeholder="Enter item description"
                                  className="mt-1"
                                  rows={3}
                                />
                              </div>
                            )}
                            
                            {section.type === "links" && (
                              <>
                                <div>
                                  <Label htmlFor={`item-${itemIndex}-linkText`}>Link Text</Label>
                                  <Input
                                    id={`item-${itemIndex}-linkText`}
                                    value={item.linkText || ""}
                                    onChange={(e) => updateSectionItem(sectionIndex, itemIndex, "linkText", e.target.value)}
                                    placeholder="Click here"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`item-${itemIndex}-linkUrl`}>Link URL</Label>
                                  <Input
                                    id={`item-${itemIndex}-linkUrl`}
                                    value={item.linkUrl || ""}
                                    onChange={(e) => updateSectionItem(sectionIndex, itemIndex, "linkUrl", e.target.value)}
                                    placeholder="https://"
                                    className="mt-1"
                                  />
                                </div>
                              </>
                            )}
                            
                            {section.type === "whatsapp" && (
                              <div>
                                <Label htmlFor={`item-${itemIndex}-content`}>Message Template</Label>
                                <Textarea
                                  id={`item-${itemIndex}-content`}
                                  value={item.content || ""}
                                  onChange={(e) => updateSectionItem(sectionIndex, itemIndex, "content", e.target.value)}
                                  placeholder="Enter WhatsApp message template..."
                                  className="mt-1"
                                  rows={5}
                                />
                              </div>
                            )}
                            
                            {section.type === "social" && (
                              <>
                                <div>
                                  <Label htmlFor={`item-${itemIndex}-image`}>Image</Label>
                                  <div className="mt-1 flex flex-col gap-2">
                                    <div className="h-32 bg-gray-100 border rounded flex items-center justify-center overflow-hidden">
                                      {item.imageUrl && (
                                        <img 
                                          src={item.imageUrl} 
                                          alt="Social post preview" 
                                          className="max-h-full object-cover" 
                                        />
                                      )}
                                    </div>
                                    <Input
                                      id={`item-${itemIndex}-image`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, "imageUrl", "sections", sectionIndex, itemIndex)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`item-${itemIndex}-description`}>Description</Label>
                                  <Textarea
                                    id={`item-${itemIndex}-description`}
                                    value={item.description || ""}
                                    onChange={(e) => updateSectionItem(sectionIndex, itemIndex, "description", e.target.value)}
                                    placeholder="Enter post description"
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </Card>
                      ))}
                      
                      {section.items.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">No items in this section</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => addSectionItem(sectionIndex)}
                            className="mt-2"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKitCreator;
