export interface IUser {
    id: string;
    name: string; // Ensure this is always a string
    email: string;
    image?: string | null;
    bio?: string | null;
    instagramId?: string | null;
    followers: {
      id: string;
      createdAt: Date;
      followerId: string;
      followingId: string;
    }[];
    following: {
      id: string;
      createdAt: Date;
      followerId: string;
      followingId: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }