
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useKits } from "@/hooks/useKits";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Share, ExternalLink, Loader2 } from "lucide-react";

const VideoModal = ({ isOpen, onClose, videoUrl }: { isOpen: boolean; onClose: () => void; videoUrl?: string | null }) => {
  const embedUrl = videoUrl ? 
    videoUrl.replace("youtube.com/watch?v=", "youtube.com/embed/").replace("youtu.be/", "youtube.com/embed/") : 
    "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-[800px] text-white">
        <DialogHeader>
          <DialogTitle>Watch Video</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          {videoUrl ? (
            <iframe 
              className="w-full h-full" 
              src={embedUrl} 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <p className="text-gray-400">No video available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const KitDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { useKitDetails } = useKits();
  const { data: kit, isLoading } = useKitDetails(id);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { toast } = useToast();

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setVideoModalOpen(true);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: message,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Kit Not Found</h1>
            <p className="text-gray-600 mb-6">The fundraising kit you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link to="/">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Find sections by type
  const videoSection = kit.sections?.find(s => s.section_type === 'video');
  const whatToDoSection = kit.sections?.find(s => s.section_type === 'whatToDo');
  const whatsappSection = kit.sections?.find(s => s.section_type === 'whatsapp');
  const socialSection = kit.sections?.find(s => s.section_type === 'social');
  
  // Get items for each section
  const videoItems = kit.items?.filter(item => item.section_id === videoSection?.id) || [];
  const whatToDoItems = kit.items?.filter(item => item.section_id === whatToDoSection?.id) || [];
  const whatsappItems = kit.items?.filter(item => item.section_id === whatsappSection?.id) || [];
  const socialItems = kit.items?.filter(item => item.section_id === socialSection?.id) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative">
        <div className="hidden md:block">
          {kit.header_desktop_image ? (
            <img 
              src={kit.header_desktop_image} 
              alt={kit.name} 
              className="w-full h-[300px] object-cover"
            />
          ) : (
            <div className="w-full h-[300px] bg-yellow-500 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white">{kit.name}</h1>
            </div>
          )}
        </div>
        <div className="md:hidden">
          {kit.header_mobile_image ? (
            <img 
              src={kit.header_mobile_image} 
              alt={kit.name} 
              className="w-full h-[200px] object-cover"
            />
          ) : kit.header_desktop_image ? (
            <img 
              src={kit.header_desktop_image} 
              alt={kit.name} 
              className="w-full h-[200px] object-cover"
            />
          ) : (
            <div className="w-full h-[200px] bg-yellow-500 flex items-center justify-center">
              <h1 className="text-2xl font-bold text-white">{kit.name}</h1>
            </div>
          )}
        </div>
        <div className="absolute top-4 left-4">
          <Button 
            asChild
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur-sm border-transparent hover:bg-white"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{kit.name}</h1>
          {kit.description && (
            <p className="text-gray-600">{kit.description}</p>
          )}
        </div>

        {/* Video Section */}
        {videoSection && videoItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Video</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <p className="text-gray-500">No preview image</p>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => item.video_url && openVideoModal(item.video_url)}
                      >
                        Watch Video
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What To Do Section */}
        {whatToDoSection && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">What To Do</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ol className="space-y-6">
                {whatToDoItems.length > 0 ? (
                  whatToDoItems.map((item, index) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0 flex items-start">
                        <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-gray-600">{item.content}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No steps have been added yet.</p>
                )}
              </ol>
            </div>
          </div>
        )}

        {/* WhatsApp Section */}
        {whatsappSection && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">WhatsApp Messages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whatsappItems.length > 0 ? (
                whatsappItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                    <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <p className="whitespace-pre-wrap text-gray-700">{item.content}</p>
                    </div>
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => copyToClipboard(item.content || "", "WhatsApp message copied to clipboard")}
                    >
                      Copy Message
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-500">No WhatsApp messages have been added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Section */}
        {socialSection && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Social Media Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialItems.length > 0 ? (
                socialItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">No image</p>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => copyToClipboard(item.content || "", "Post text copied to clipboard")}
                        >
                          Copy Text
                        </Button>
                        <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                          <Share className="h-4 w-4 mr-1" /> Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-500">No social media posts have been added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to action */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1">Ready to start fundraising?</h3>
            <p className="text-gray-600">Use this kit to help raise funds for your cause.</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-yellow-500 hover:bg-yellow-600">
            <ExternalLink className="h-4 w-4 mr-1" /> Start Now
          </Button>
        </div>
      </div>

      <VideoModal 
        isOpen={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)} 
        videoUrl={selectedVideo} 
      />
    </div>
  );
};

export default KitDetails;
