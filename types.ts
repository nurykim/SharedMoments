
export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  accessToken?: string; // For real Google API calls
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
  configDriveFileId?: string; // Reference to the .json file in Drive
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

export interface Invitation {
  groupId: string;
  groupName: string;
  hostEmail: string;
}
