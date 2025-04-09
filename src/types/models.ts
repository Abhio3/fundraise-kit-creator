
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'fundraiser';
  createdAt: string;
}

export interface Fundraiser {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
}

export interface FundraisingKit {
  id: string;
  name: string;
  fundraiserId: string;
  createdAt: string;
  updatedAt: string;
  headerSection: HeaderSection;
  videoSection?: VideoSection;
  sections: Section[];
  contactSection?: ContactSection;
}

export interface HeaderSection {
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  backgroundColor?: string;
}

export interface VideoSection {
  title?: string;
  subtitle?: string;
  description?: string;
  youtubeVideoId: string;
  buttonText: string;
}

export interface Section {
  id: string;
  title: string;
  type: 'steps' | 'links' | 'whatsapp' | 'social' | 'info';
  items: SectionItem[];
  backgroundColor?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  content?: string;
}

export interface ContactSection {
  whatsappNumber?: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyPhoneNumber?: string;
  showFailedDonation?: boolean;
}
