
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useKits, Kit, Fundraiser, KitSection } from "@/hooks/useKits";
import { Loader2, Upload, PlusCircle, Trash2, X } from "lucide-react";

interface KitFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (kitData: Kit) => void;
  fundraisers: Fundraiser[];
  editingKit?: Kit; // Optional prop for editing existing kit
}

const KitFormModal = ({ 
  open, 
  onClose, 
  onSave, 
  fundraisers = [], 
  editingKit 
}: KitFormModalProps) => {
  const isEditing = !!editingKit;
  const [step, setStep] = useState(1);
  const [kitData, setKitData] = useState<Kit>(editingKit || {
    name: "",
    description: "",
    header_desktop_image: "",
    header_mobile_image: "",
    fundraiser_id: null,
    sections: [],
  });
  
  const [customSections, setCustomSections] = useState<KitSection[]>(
    editingKit?.sections || []
  );
  
  const [isUploading, setIsUploading] = useState({
    desktop: false,
    mobile: false
  });
  
  const { uploadImage } = useKits();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKitData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setKitData((prev) => ({ ...prev, [name]: value }));
  };

  const addSection = (type: KitSection["section_type"]) => {
    const sectionNames = {
      video: "Video Section",
      whatToDo: "What To Do Steps",
      whatsapp: "WhatsApp Templates",
      social: "Social Media Posts"
    };
    
    const newSection: KitSection = {
      name: sectionNames[type],
      section_type: type,
      position: customSections.length
    };
    
    setCustomSections([...customSections, newSection]);
  };

  const removeSection = (index: number) => {
    const updatedSections = [...customSections];
    updatedSections.splice(index, 1);
    
    // Update positions for remaining sections
    const reorderedSections = updatedSections.map((section, idx) => ({
      ...section,
      position: idx
    }));
    
    setCustomSections(reorderedSections);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [type]: true }));

    try {
      const imageUrl = await uploadImage(file, 'headers');
      if (imageUrl) {
        setKitData(prev => ({
          ...prev,
          [type === 'desktop' ? 'header_desktop_image' : 'header_mobile_image']: imageUrl
        }));
      }
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleNext = () => {
    if (step === 3) {
      // Update kit data with current sections before going to review
      setKitData(prev => ({ ...prev, sections: customSections }));
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Make sure we have the latest sections
    const finalKitData = { ...kitData, sections: customSections };
    onSave(finalKitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {isEditing ? "Edit" : "Create"} Fundraising Kit
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Step {step} of 4: {step === 1 ? "Basic Info" : step === 2 ? "Header Design" : step === 3 ? "Sections" : "Review"}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Kit Name</Label>
                <Input
                  id="name"
                  name="name"
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter kit name"
                  value={kitData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="bg-gray-800 border-gray-700"
                  placeholder="Describe your fundraising kit"
                  value={kitData.description || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fundraiser">Assign to Fundraiser</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("fundraiser_id", value)}
                  value={kitData.fundraiser_id || "none"}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a fundraiser" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="none">No Assignment</SelectItem>
                    {fundraisers.map((fundraiser) => (
                      <SelectItem key={fundraiser.id} value={fundraiser.id || ""}>
                        {fundraiser.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="headerDesktopImage">Desktop Header Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="headerDesktopImage"
                    type="file"
                    accept="image/*"
                    className="bg-gray-800 border-gray-700"
                    onChange={(e) => handleFileUpload(e, 'desktop')}
                    disabled={isUploading.desktop}
                  />
                  {isUploading.desktop && (
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-300" />
                  )}
                </div>
                {kitData.header_desktop_image && (
                  <div className="relative mt-2">
                    <img 
                      src={kitData.header_desktop_image} 
                      alt="Desktop preview" 
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-xs text-gray-400 mt-1">Upload successful</p>
                  </div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="headerMobileImage">Mobile Header Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="headerMobileImage"
                    type="file"
                    accept="image/*"
                    className="bg-gray-800 border-gray-700"
                    onChange={(e) => handleFileUpload(e, 'mobile')}
                    disabled={isUploading.mobile}
                  />
                  {isUploading.mobile && (
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-300" />
                  )}
                </div>
                {kitData.header_mobile_image && (
                  <div className="relative mt-2">
                    <img 
                      src={kitData.header_mobile_image} 
                      alt="Mobile preview" 
                      className="w-40 h-32 object-cover rounded"
                    />
                    <p className="text-xs text-gray-400 mt-1">Upload successful</p>
                  </div>
                )}
              </div>
              
              {!kitData.header_desktop_image && !kitData.header_mobile_image && (
                <div className="grid gap-2">
                  <Label>Preview</Label>
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center">
                    <div className="bg-gray-700 h-40 flex items-center justify-center rounded">
                      <div className="text-gray-400 flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <p>Upload images for preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Kit Sections</Label>
                <p className="text-sm text-gray-400 mb-2">
                  Add or remove sections for your fundraising kit. Each section can contain different types of content.
                </p>
                
                <div className="space-y-3">
                  {customSections.length > 0 ? (
                    <div className="space-y-2">
                      {customSections.map((section, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-700"
                        >
                          <div>
                            <p className="font-medium">{section.name}</p>
                            <p className="text-xs text-gray-400">
                              {section.section_type === "video" && "Video content"}
                              {section.section_type === "whatToDo" && "Step by step instructions"}
                              {section.section_type === "whatsapp" && "WhatsApp message templates"}
                              {section.section_type === "social" && "Social media content"}
                            </p>
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => removeSection(index)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center">
                      <p className="text-gray-400">No sections added yet. Add sections below.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="font-semibold mb-2">Add Section</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 flex items-center"
                      onClick={() => addSection("video")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> 
                      Video Section
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 flex items-center"
                      onClick={() => addSection("whatToDo")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> 
                      What To Do
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 flex items-center"
                      onClick={() => addSection("whatsapp")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> 
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 flex items-center"
                      onClick={() => addSection("social")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> 
                      Social Posts
                    </Button>
                  </div>
                </div>
                
                {customSections.length === 0 && (
                  <p className="text-yellow-300 text-sm">Please add at least one section to continue.</p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 py-4">
              <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                <h3 className="font-medium mb-2">Kit Summary</h3>
                <p><strong>Name:</strong> {kitData.name}</p>
                <p><strong>Description:</strong> {kitData.description || "No description provided"}</p>
                <p><strong>Header Images:</strong> {kitData.header_desktop_image ? "Desktop ✓" : "Desktop ✗"} | {kitData.header_mobile_image ? "Mobile ✓" : "Mobile ✗"}</p>
                <p><strong>Sections ({customSections.length}):</strong> {customSections.map(s => s.name).join(", ") || "No sections selected"}</p>
                <p><strong>Fundraiser:</strong> {kitData.fundraiser_id !== "none" && kitData.fundraiser_id !== null ? 
                  fundraisers.find(f => f.id === kitData.fundraiser_id)?.name || "None" : 
                  "None"}</p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="border-gray-700 hover:bg-gray-800">
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-700 hover:bg-gray-800">
                Cancel
              </Button>
            )}

            {step < 4 ? (
              <Button 
                type="button" 
                onClick={handleNext} 
                className="bg-yellow-300 hover:bg-yellow-400 text-black"
                disabled={step === 3 && customSections.length === 0}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="bg-yellow-300 hover:bg-yellow-400 text-black"
                disabled={!kitData.name || (!kitData.header_desktop_image && !kitData.header_mobile_image)}
              >
                {isEditing ? "Update" : "Create"} Kit
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KitFormModal;
