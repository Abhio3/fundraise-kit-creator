
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
import { useKits, Kit, Fundraiser } from "@/hooks/useKits";
import { Loader2, Upload } from "lucide-react";

interface KitFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (kitData: Kit) => void;
  fundraisers: Fundraiser[];
}

const KitFormModal = ({ open, onClose, onSave, fundraisers = [] }: KitFormModalProps) => {
  const [step, setStep] = useState(1);
  const [kitData, setKitData] = useState<Kit>({
    name: "",
    description: "",
    header_desktop_image: "",
    header_mobile_image: "",
    fundraiser_id: null,
    sections: [],
  });
  
  const [selectedSections, setSelectedSections] = useState<{
    video: boolean;
    whatToDo: boolean;
    whatsapp: boolean;
    social: boolean;
  }>({
    video: false,
    whatToDo: false,
    whatsapp: false,
    social: false
  });
  
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

  const handleSectionToggle = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
      // Process sections before going to review
      const sections: Kit["sections"] = [];
      let position = 0;
      
      if (selectedSections.video) {
        sections.push({
          name: "Video Section",
          section_type: "video",
          position: position++
        });
      }
      
      if (selectedSections.whatToDo) {
        sections.push({
          name: "What To Do Steps",
          section_type: "whatToDo",
          position: position++
        });
      }
      
      if (selectedSections.whatsapp) {
        sections.push({
          name: "WhatsApp Templates",
          section_type: "whatsapp",
          position: position++
        });
      }
      
      if (selectedSections.social) {
        sections.push({
          name: "Social Media Posts",
          section_type: "social",
          position: position++
        });
      }
      
      setKitData(prev => ({ ...prev, sections }));
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(kitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Create Fundraising Kit</DialogTitle>
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
                  value={kitData.fundraiser_id || ""}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a fundraiser" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="">No Assignment</SelectItem>
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
                  <p className="text-xs text-gray-400">Upload successful</p>
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
                  <p className="text-xs text-gray-400">Upload successful</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Preview</Label>
                <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center">
                  {kitData.header_desktop_image ? (
                    <img 
                      src={kitData.header_desktop_image} 
                      alt="Desktop Preview" 
                      className="max-h-40 mx-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x200/yellow/black?text=Preview";
                      }}
                    />
                  ) : (
                    <div className="bg-gray-700 h-40 flex items-center justify-center rounded">
                      <div className="text-gray-400 flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <p>Upload desktop header image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Sections</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="video" 
                      className="accent-yellow-300 w-4 h-4" 
                      checked={selectedSections.video}
                      onChange={() => handleSectionToggle('video')}
                    />
                    <Label htmlFor="video">Video Section</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="whatToDo" 
                      className="accent-yellow-300 w-4 h-4" 
                      checked={selectedSections.whatToDo}
                      onChange={() => handleSectionToggle('whatToDo')}
                    />
                    <Label htmlFor="whatToDo">What To Do Steps</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="whatsapp" 
                      className="accent-yellow-300 w-4 h-4" 
                      checked={selectedSections.whatsapp}
                      onChange={() => handleSectionToggle('whatsapp')}
                    />
                    <Label htmlFor="whatsapp">WhatsApp Templates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="social" 
                      className="accent-yellow-300 w-4 h-4" 
                      checked={selectedSections.social}
                      onChange={() => handleSectionToggle('social')}
                    />
                    <Label htmlFor="social">Social Media Posts</Label>
                  </div>
                </div>
              </div>
              {!selectedSections.video && 
               !selectedSections.whatToDo && 
               !selectedSections.whatsapp && 
               !selectedSections.social && (
                <p className="text-yellow-300 text-sm">Please select at least one section to continue.</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 py-4">
              <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                <h3 className="font-medium mb-2">Kit Summary</h3>
                <p><strong>Name:</strong> {kitData.name}</p>
                <p><strong>Description:</strong> {kitData.description || "No description provided"}</p>
                <p><strong>Header Images:</strong> {kitData.header_desktop_image ? "Desktop ✓" : "Desktop ✗"} | {kitData.header_mobile_image ? "Mobile ✓" : "Mobile ✗"}</p>
                <p><strong>Sections:</strong> {kitData.sections?.map(s => s.name).join(", ") || "No sections selected"}</p>
                <p><strong>Fundraiser:</strong> {fundraisers.find(f => f.id === kitData.fundraiser_id)?.name || "None"}</p>
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
                disabled={step === 3 && !selectedSections.video && !selectedSections.whatToDo && !selectedSections.whatsapp && !selectedSections.social}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="bg-yellow-300 hover:bg-yellow-400 text-black"
                disabled={!kitData.name || (!kitData.header_desktop_image && !kitData.header_mobile_image)}
              >
                Create Kit
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KitFormModal;
