import { User } from './auth';

export interface TeamMember extends User {
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
  accountType: 'personal' | 'company';
}

export interface Announcement {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    accountType: string;
  };
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementCreateRequest {
  message: string;
}
