
import { useState } from "react";
import { useToast } from "./use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type KitSection = {
  id?: string;
  name: string;
  description?: string | null;
  section_type: "video" | "whatToDo" | "whatsapp" | "social";
  position: number;
  kit_id?: string;
};

export type KitItem = {
  id?: string;
  title: string;
  content?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  position: number;
  section_id?: string;
};

export type Kit = {
  id?: string;
  name: string;
  description?: string | null;
  header_desktop_image?: string | null;
  header_mobile_image?: string | null;
  fundraiser_id?: string | null;
  user_id?: string;
  sections?: KitSection[];
  items?: KitItem[];
};

export type Fundraiser = {
  id?: string;
  name: string;
  description?: string | null;
  user_id?: string;
};

export const useKits = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all kits for the current user
  const getKits = async () => {
    const { data: kits, error } = await supabase
      .from("kits")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      toast({
        title: "Failed to load kits",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading kits:", error);
      return [];
    }

    return kits || [];
  };

  // Fetch a single kit with all sections and items
  const getKit = async (kitId: string) => {
    const { data: kit, error: kitError } = await supabase
      .from("kits")
      .select("*")
      .eq("id", kitId)
      .single();

    if (kitError) {
      toast({
        title: "Failed to load kit",
        description: kitError.message,
        variant: "destructive",
      });
      console.error("Error loading kit:", kitError);
      return null;
    }

    // Get all sections for this kit
    const { data: sections, error: sectionsError } = await supabase
      .from("kit_sections")
      .select("*")
      .eq("kit_id", kitId)
      .order("position");

    if (sectionsError) {
      console.error("Error loading sections:", sectionsError);
    }

    // Get all items for all sections
    let items: KitItem[] = [];
    if (sections && sections.length > 0) {
      const sectionIds = sections.map(section => section.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from("kit_items")
        .select("*")
        .in("section_id", sectionIds)
        .order("position");

      if (itemsError) {
        console.error("Error loading items:", itemsError);
      } else {
        items = itemsData || [];
      }
    }

    return { ...kit, sections: sections || [], items };
  };

  // Create a new kit
  const createKit = async (kit: Kit) => {
    // First create the kit
    const { data: newKit, error: kitError } = await supabase
      .from("kits")
      .insert({
        name: kit.name,
        description: kit.description,
        header_desktop_image: kit.header_desktop_image,
        header_mobile_image: kit.header_mobile_image,
        fundraiser_id: kit.fundraiser_id === "none" ? null : kit.fundraiser_id,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (kitError) {
      toast({
        title: "Failed to create kit",
        description: kitError.message,
        variant: "destructive",
      });
      console.error("Error creating kit:", kitError);
      return null;
    }

    // If there are sections, create them
    if (kit.sections && kit.sections.length > 0 && newKit) {
      for (const section of kit.sections) {
        const { error: sectionError } = await supabase
          .from("kit_sections")
          .insert({
            kit_id: newKit.id,
            name: section.name,
            description: section.description,
            section_type: section.section_type,
            position: section.position,
          });

        if (sectionError) {
          console.error("Error creating section:", sectionError);
        }
      }
    }

    toast({
      title: "Kit created successfully",
      description: `Your kit "${kit.name}" has been created.`,
    });

    return newKit;
  };

  // Update an existing kit
  const updateKit = async (kit: Kit) => {
    if (!kit.id) {
      toast({
        title: "Failed to update kit",
        description: "Kit ID is missing",
        variant: "destructive",
      });
      return null;
    }

    // First update the kit
    const { error: kitError } = await supabase
      .from("kits")
      .update({
        name: kit.name,
        description: kit.description,
        header_desktop_image: kit.header_desktop_image,
        header_mobile_image: kit.header_mobile_image,
        fundraiser_id: kit.fundraiser_id === "none" ? null : kit.fundraiser_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", kit.id);

    if (kitError) {
      toast({
        title: "Failed to update kit",
        description: kitError.message,
        variant: "destructive",
      });
      console.error("Error updating kit:", kitError);
      return null;
    }

    // Get existing sections to compare with new ones
    const { data: existingSections } = await supabase
      .from("kit_sections")
      .select("id, section_type")
      .eq("kit_id", kit.id);

    // Delete sections that are no longer in the kit
    if (existingSections) {
      const newSectionIds = kit.sections?.map(s => s.id).filter(Boolean) || [];
      const sectionsToDelete = existingSections.filter(s => !newSectionIds.includes(s.id));
      
      for (const section of sectionsToDelete) {
        const { error } = await supabase
          .from("kit_sections")
          .delete()
          .eq("id", section.id);
        
        if (error) {
          console.error(`Error deleting section ${section.id}:`, error);
        }
      }
    }

    // Update or create sections
    if (kit.sections && kit.sections.length > 0) {
      for (const section of kit.sections) {
        if (section.id) {
          // Update existing section
          const { error } = await supabase
            .from("kit_sections")
            .update({
              name: section.name,
              description: section.description,
              section_type: section.section_type,
              position: section.position,
              updated_at: new Date().toISOString(),
            })
            .eq("id", section.id);

          if (error) {
            console.error(`Error updating section ${section.id}:`, error);
          }
        } else {
          // Create new section
          const { error } = await supabase
            .from("kit_sections")
            .insert({
              kit_id: kit.id,
              name: section.name,
              description: section.description,
              section_type: section.section_type,
              position: section.position,
            });

          if (error) {
            console.error("Error creating new section:", error);
          }
        }
      }
    }

    toast({
      title: "Kit updated successfully",
      description: `Your kit "${kit.name}" has been updated.`,
    });

    return await getKit(kit.id);
  };

  // Upload an image to Supabase storage
  const uploadImage = async (file: File, path: string) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Upload the file
      const { error } = await supabase.storage
        .from('kit_media')
        .upload(filePath, file);

      if (error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error uploading file:", error);
        return null;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('kit_media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error in upload:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Get all fundraisers
  const getFundraisers = async () => {
    const { data, error } = await supabase
      .from("fundraisers")
      .select("*")
      .order("name");
      
    if (error) {
      console.error("Error loading fundraisers:", error);
      return [];
    }
    
    return data || [];
  };

  // Create a fundraiser
  const createFundraiser = async (fundraiser: Fundraiser) => {
    const { data, error } = await supabase
      .from("fundraisers")
      .insert({
        name: fundraiser.name,
        description: fundraiser.description,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to create fundraiser",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error creating fundraiser:", error);
      return null;
    }

    toast({
      title: "Fundraiser created",
      description: `Fundraiser "${fundraiser.name}" has been created.`,
    });

    return data;
  };

  // Use React Query for kits
  const useKitsList = () => {
    return useQuery({
      queryKey: ["kits"],
      queryFn: getKits,
    });
  };

  // Use React Query for a single kit
  const useKitDetails = (kitId: string | undefined) => {
    return useQuery({
      queryKey: ["kit", kitId],
      queryFn: () => kitId ? getKit(kitId) : null,
      enabled: !!kitId,
    });
  };

  // Use React Query for fundraisers
  const useFundraisersList = () => {
    return useQuery({
      queryKey: ["fundraisers"],
      queryFn: getFundraisers,
    });
  };

  // Mutation for creating a kit
  const useCreateKit = () => {
    return useMutation({
      mutationFn: createKit,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["kits"] });
      },
    });
  };

  // Mutation for updating a kit
  const useUpdateKit = () => {
    return useMutation({
      mutationFn: updateKit,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["kits"] });
        if (data?.id) {
          queryClient.invalidateQueries({ queryKey: ["kit", data.id] });
        }
      },
    });
  };

  // Mutation for creating a fundraiser
  const useCreateFundraiser = () => {
    return useMutation({
      mutationFn: createFundraiser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fundraisers"] });
      },
    });
  };

  return {
    getKits,
    getKit,
    createKit,
    updateKit,
    uploadImage,
    isUploading,
    useKitsList,
    useKitDetails,
    useCreateKit,
    useUpdateKit,
    getFundraisers,
    createFundraiser,
    useFundraisersList,
    useCreateFundraiser,
  };
};
