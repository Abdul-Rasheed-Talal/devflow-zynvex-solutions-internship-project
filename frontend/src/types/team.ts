import { User } from './auth';

export interface TeamMember extends User {
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
  accountType: 'personal' | 'company';
  companyName?: string;
  subscriptionPlan?: 'basic' | 'pro';
  projectRole?: string;
  addedAt?: string;
}

export interface ProjectTeamDirectory {
  projectId: string;
  projectName: string;
  myRole: string;
  members: TeamMember[];
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
