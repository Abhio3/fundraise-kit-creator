
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/Navbar";
import { FundraisingKit, SectionItem } from "@/types/models";
import { kitService } from "@/services/api";
import { ArrowLeft, Download, ExternalLink, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const KitView = () => {
  const { kitId } = useParams<{ kitId: string }>();
  const [kit, setKit] = useState<FundraisingKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<{ sectionIndex: number; itemIndex: number } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadKit = async () => {
      if (!kitId) return;
      
      try {
        setIsLoading(true);
        const kitData = await kitService.getKitById(kitId);
        setKit(kitData);
      } catch (error) {
        console.error("Error loading kit:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadKit();
  }, [kitId]);
  
  const getImageUrl = () => {
    if (!kit) return "";
    return isMobile ? kit.headerSection.mobileImageUrl : kit.headerSection.desktopImageUrl;
  };

  const handleItemClick = (sectionIndex: number, itemIndex: number) => {
    const isCurrentlyExpanded = expandedItem?.sectionIndex === sectionIndex && expandedItem?.itemIndex === itemIndex;
    
    if (isCurrentlyExpanded) {
      setExpandedItem(null);
    } else {
      setExpandedItem({ sectionIndex, itemIndex });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-20 px-4 text-center">
          <div className="animate-pulse inline-block">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Fundraising Kit Not Found</h1>
          <p className="mb-8">The kit you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <section
        className="relative bg-cover bg-center py-16 md:py-24"
        style={{ backgroundImage: `url(${getImageUrl()})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="container mx-auto px-4 relative z-10 text-white text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{kit.headerSection.title}</h1>
          {kit.headerSection.subtitle && (
            <p className="text-xl md:text-2xl">{kit.headerSection.subtitle}</p>
          )}
        </div>
      </section>

      {/* Video Section */}
      {kit.videoSection && kit.videoSection.youtubeVideoId && (
        <section className="bg-fundraise-blue text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-2">{kit.videoSection.title}</h2>
            {kit.videoSection.subtitle && (
              <p className="mb-6">{kit.videoSection.subtitle}</p>
            )}
            <Button 
              className="bg-white text-fundraise-blue hover:bg-fundraise-lightyellow"
              onClick={() => setVideoOpen(true)}
            >
              {kit.videoSection.buttonText}
            </Button>

            <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{kit.videoSection.title}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${kit.videoSection.youtubeVideoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      )}

      {/* Dynamic Sections */}
      {kit.sections.map((section, sectionIndex) => (
        <section 
          key={section.id} 
          className={`py-12 ${sectionIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">{section.title}</h2>
            
            {section.type === 'steps' && (
              <div className="space-y-8 max-w-3xl mx-auto">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={item.id} 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="bg-fundraise-blue text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                        {itemIndex + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        {item.description && <p className="text-gray-600">{item.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {section.type === 'links' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {section.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center"
                  >
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <ExternalLink className="h-5 w-5 text-fundraise-blue flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
            
            {section.type === 'whatsapp' && (
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible>
                  {section.items.map((item, itemIndex) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="bg-white px-6 py-4 rounded-t-lg shadow-sm hover:bg-gray-50">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent className="bg-white px-6 pb-4 rounded-b-lg shadow-sm border-t">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mt-2 mb-4 whitespace-pre-wrap">
                          {item.content}
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            if (item.content) {
                              navigator.clipboard.writeText(item.content);
                              alert("Message copied to clipboard!");
                            }
                          }}
                        >
                          Copy Message
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            
            {section.type === 'social' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {section.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                  >
                    <div className="h-48 bg-gray-200">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          if (item.imageUrl) {
                            window.open(item.imageUrl, '_blank');
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {section.type === 'info' && (
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible>
                  {section.items.map((item, itemIndex) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="bg-white px-6 py-4 rounded-t-lg shadow-sm hover:bg-gray-50">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent className="bg-white px-6 pb-4 rounded-b-lg shadow-sm border-t">
                        {item.description && <p className="py-2">{item.description}</p>}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </section>
      ))}
      
      {/* Contact Section */}
      {kit.contactSection && (
        <section className="bg-fundraise-lightyellow py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Need Help?</h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {kit.contactSection.whatsappNumber && (
                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
                  <div className="flex-grow">
                    <p className="text-gray-600">Having issues? Contact us on WhatsApp</p>
                    <p className="font-semibold">{kit.contactSection.whatsappNumber}</p>
                  </div>
                  <a
                    href={`https://wa.me/${kit.contactSection.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-green-500 hover:bg-green-600">
                      WhatsApp
                    </Button>
                  </a>
                </div>
              )}
              
              {kit.contactSection.emergencyPhoneNumber && (
                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
                  <div className="flex-grow">
                    <p className="text-gray-600">Need urgent help? Call:</p>
                    <p className="font-semibold">
                      {kit.contactSection.emergencyContactName ? `${kit.contactSection.emergencyContactName}: ` : ""}
                      {kit.contactSection.emergencyPhoneNumber}
                    </p>
                  </div>
                  <a href={`tel:${kit.contactSection.emergencyPhoneNumber.replace(/\D/g, '')}`}>
                    <Button>
                      Call
                    </Button>
                  </a>
                </div>
              )}
              
              {kit.contactSection.showFailedDonation && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="mr-3 text-xl">😕</div>
                    <h3 className="font-semibold">Failed Donation?</h3>
                  </div>
                  <Button className="w-full">
                    Submit Issue
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default KitView;
