
export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  accessToken?: string;
}

export interface DriveItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  thumbnailUrl?: string;
  mimeType: string;
  parentId?: string;
}

export interface Group {
  id: string;
  name: string;
  hostId: string;
  memberEmails: string[];
  driveFolderId: string; // The specific folder ID in Google Drive
  path: string; // e.g., "SharedMoments/Family"
}

export interface Post {
  id: string;
  userId: string;
  groupId: string;
  imageUrls: string[];
  comment: string;
  timestamp: number;
}

export enum Page {
  AUTH = 'AUTH',
  GROUP_SELECTION = 'GROUP_SELECTION',
  MAIN_FEED = 'MAIN_FEED'
}
