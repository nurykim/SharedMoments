
import React, { useState, useEffect } from 'react';
import { Page, User, Group, Post } from './types';
import AuthPage from './components/AuthPage';
import GroupSelectionPage from './components/GroupSelectionPage';
import MainFeedPage from './components/MainFeedPage';

const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; // User must replace this
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isScanningDrive, setIsScanningDrive] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);

  useEffect(() => {
    // Fix: Access google property via type assertion to window to avoid TypeScript error (Property 'google' does not exist on type 'Window')
    const google = (window as any).google;
    // Initialize Google Identity Services
    if (google) {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            handleAuthSuccess(tokenResponse.access_token);
          }
        },
      });
      setTokenClient(client);
    }
  }, []);

  const handleAuthSuccess = async (accessToken: string) => {
    setIsScanningDrive(true);
    setCurrentPage(Page.GROUP_SELECTION);

    try {
      // 1. Fetch User Info
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userData = await userRes.json();
      const authenticatedUser: User = {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        photoUrl: userData.picture,
        accessToken
      };
      setUser(authenticatedUser);

      // 2. Find or Create SharedMoments Root
      const rootId = await findOrCreateFolder(accessToken, 'SharedMoments');
      
      // 3. List Subfolders (Groups)
      const groupFolders = await listFoldersIn(accessToken, rootId);
      const groupList: Group[] = groupFolders.map((f: any) => ({
        id: f.id,
        name: f.name,
        hostId: authenticatedUser.id,
        memberEmails: [authenticatedUser.email],
        driveFolderId: f.id,
        path: `SharedMoments/${f.name}`
      }));

      setGroups(groupList);
    } catch (error) {
      console.error("Drive Sync Error:", error);
    } finally {
      setIsScanningDrive(false);
    }
  };

  const findOrCreateFolder = async (token: string, name: string, parentId?: string) => {
    const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentId ? ` and '${parentId}' in parents` : ''}`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.files && data.files.length > 0) return data.files[0].id;

    // Create if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : []
      })
    });
    const newFolder = await createRes.json();
    return newFolder.id;
  };

  const listFoldersIn = async (token: string, parentId: string) => {
    const q = `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.files || [];
  };

  const handleLogin = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentGroup(null);
    setCurrentPage(Page.AUTH);
  };

  const createGroupFolder = async (name: string) => {
    if (!user?.accessToken) return;
    setIsScanningDrive(true);
    const rootId = await findOrCreateFolder(user.accessToken, 'SharedMoments');
    const folderId = await findOrCreateFolder(user.accessToken, name, rootId);
    
    const newGroup: Group = {
      id: folderId,
      name,
      hostId: user.id,
      memberEmails: [user.email],
      driveFolderId: folderId,
      path: `SharedMoments/${name}`
    };
    
    setGroups([...groups, newGroup]);
    setCurrentGroup(newGroup);
    setCurrentPage(Page.MAIN_FEED);
    setIsScanningDrive(false);
  };

  const selectGroup = async (group: Group) => {
    setCurrentGroup(group);
    setIsScanningDrive(true);
    // Fetch photos in this group folder
    if (user?.accessToken) {
      const q = `'${group.driveFolderId}' in parents and mimeType contains 'image/' and trashed=false`;
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,description,createdTime,webContentLink)`, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      const data = await res.json();
      const drivePosts: Post[] = (data.files || []).map((f: any) => ({
        id: f.id,
        userId: user.id,
        groupId: group.id,
        imageUrls: [f.webContentLink], // Note: in real app, might need custom proxy for direct display
        comment: f.description || "",
        timestamp: new Date(f.createdTime).getTime()
      }));
      setPosts(drivePosts);
    }
    setCurrentPage(Page.MAIN_FEED);
    setIsScanningDrive(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col relative overflow-hidden">
      {currentPage === Page.AUTH && <AuthPage onLogin={handleLogin} />}
      
      {currentPage === Page.GROUP_SELECTION && user && (
        <GroupSelectionPage 
          user={user} 
          groups={groups} 
          onSelect={selectGroup} 
          onCreate={createGroupFolder}
          isLoading={isScanningDrive}
        />
      )}

      {currentPage === Page.MAIN_FEED && user && currentGroup && (
        <MainFeedPage 
          user={user}
          group={currentGroup}
          posts={posts}
          onAddPost={(p) => setPosts([p, ...posts])}
          onDeletePost={(id) => setPosts(posts.filter(p => p.id !== id))}
          onEditPost={(id, comment) => setPosts(posts.map(p => p.id === id ? {...p, comment} : p))}
          onLogout={handleLogout}
          onChangeGroup={() => setCurrentPage(Page.GROUP_SELECTION)}
          onDeleteGroup={() => {}} // Implementation for Drive delete needed
          onRenameGroup={() => {}} 
          onLeaveGroup={() => {}}
          onAddMember={() => {}}
          onRemoveMember={() => {}}
        />
      )}
    </div>
  );
};

export default App;
