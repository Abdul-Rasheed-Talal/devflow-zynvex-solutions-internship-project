export interface TeamMember {
  user: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  addedAt: string;
}

export interface TeamWorkspace {
  _id: string;
  name: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}
