
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

interface KitFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (kitData: any) => void;
}

const KitFormModal = ({ open, onClose, onSave }: KitFormModalProps) => {
  const [step, setStep] = useState(1);
  const [kitData, setKitData] = useState({
    name: "",
    description: "",
    headerDesktopImage: "",
    headerMobileImage: "",
    sections: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKitData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
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
                  value={kitData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fundraiser">Assign to Fundraiser</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a fundraiser" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="new">Create New Fundraiser</SelectItem>
                    <SelectItem value="none">No Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="headerDesktopImage">Desktop Header Image URL</Label>
                <Input
                  id="headerDesktopImage"
                  name="headerDesktopImage"
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter desktop image URL"
                  value={kitData.headerDesktopImage}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="headerMobileImage">Mobile Header Image URL</Label>
                <Input
                  id="headerMobileImage"
                  name="headerMobileImage"
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter mobile image URL"
                  value={kitData.headerMobileImage}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>Preview</Label>
                <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center">
                  {kitData.headerDesktopImage ? (
                    <img 
                      src={kitData.headerDesktopImage} 
                      alt="Desktop Preview" 
                      className="max-h-40 mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x200/yellow/black?text=Preview";
                      }}
                    />
                  ) : (
                    <div className="bg-gray-700 h-40 flex items-center justify-center rounded">
                      <p className="text-gray-400">Desktop header preview</p>
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
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="video" className="accent-yellow-300" />
                    <Label htmlFor="video">Video Section</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="whatToDo" className="accent-yellow-300" />
                    <Label htmlFor="whatToDo">What To Do Steps</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="whatsapp" className="accent-yellow-300" />
                    <Label htmlFor="whatsapp">WhatsApp Templates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="social" className="accent-yellow-300" />
                    <Label htmlFor="social">Social Media Posts</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 py-4">
              <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                <h3 className="font-medium mb-2">Kit Summary</h3>
                <p><strong>Name:</strong> {kitData.name}</p>
                <p><strong>Description:</strong> {kitData.description}</p>
                <p><strong>Sections:</strong> Header, {kitData.sections.join(", ") || "No additional sections"}</p>
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
              <Button type="button" onClick={handleNext} className="bg-yellow-300 hover:bg-yellow-400 text-black">
                Next
              </Button>
            ) : (
              <Button type="submit" className="bg-yellow-300 hover:bg-yellow-400 text-black">
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
