
import { FundraisingKit, Fundraiser } from "../types/models";

// This service will be implemented with Supabase client after integration
export const kitService = {
  getKits: async (): Promise<FundraisingKit[]> => {
    // Mock data for now
    return Promise.resolve([]);
  },

  getKitById: async (id: string): Promise<FundraisingKit | null> => {
    // Mock data for now
    return Promise.resolve(null);
  },

  createKit: async (kit: Partial<FundraisingKit>): Promise<FundraisingKit> => {
    // Mock data for now
    return Promise.resolve({
      id: Date.now().toString(),
      name: kit.name || 'New Kit',
      fundraiserId: kit.fundraiserId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      headerSection: kit.headerSection || {
        title: 'Default Title',
        desktopImageUrl: '/placeholder.svg',
        mobileImageUrl: '/placeholder.svg'
      },
      sections: kit.sections || []
    });
  },

  updateKit: async (id: string, kit: Partial<FundraisingKit>): Promise<FundraisingKit> => {
    // Mock data for now
    return Promise.resolve({
      ...kit,
      id,
      updatedAt: new Date().toISOString()
    } as FundraisingKit);
  },

  deleteKit: async (id: string): Promise<void> => {
    // Mock data for now
    return Promise.resolve();
  },
};

export const fundraiserService = {
  getFundraisers: async (): Promise<Fundraiser[]> => {
    // Mock data for now
    return Promise.resolve([
      {
        id: '1',
        name: 'Education for All',
        description: 'Supporting students in need',
        userId: '1',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Healthcare Initiative',
        description: 'Providing medical care',
        userId: '1',
        createdAt: new Date().toISOString()
      }
    ]);
  },
};

export const fileService = {
  uploadFile: async (file: File, bucket: string): Promise<string> => {
    // Mock for now, will return URL
    return Promise.resolve('/placeholder.svg');
  },
};
