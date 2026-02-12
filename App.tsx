
import React, { useState, useEffect } from 'react';
import { Page, User, Group, Post } from './types';
import AuthPage from './components/AuthPage';
import GroupSelectionPage from './components/GroupSelectionPage';
import MainFeedPage from './components/MainFeedPage';
import { ShieldCheck, X, Cloud, ExternalLink, Info, AlertCircle } from 'lucide-react';

const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isScanningDrive, setIsScanningDrive] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  
  // BYOP (Bring Your Own Project) States
  const [clientId, setClientId] = useState<string>(localStorage.getItem('sm_client_id') || "");
  const [showSetup, setShowSetup] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (clientId) {
      initGoogleClient(clientId);
    }
  }, [clientId]);

  const initGoogleClient = (id: string) => {
    const google = (window as any).google;
    if (google) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: id,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            if (tokenResponse.access_token) {
              handleAuthSuccess(tokenResponse.access_token);
            }
          },
        });
        setTokenClient(client);
      } catch (e) {
        console.error("Invalid Client ID format", e);
        localStorage.removeItem('sm_client_id');
        setClientId("");
      }
    }
  };

  const handleAuthSuccess = async (accessToken: string) => {
    setIsScanningDrive(true);
    setCurrentPage(Page.GROUP_SELECTION);
    setShowConsent(false);

    try {
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

      const rootId = await findOrCreateFolder(accessToken, 'SharedMoments');
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
      alert("Auth failed. Check if your Client ID is correct and has Drive API enabled.");
      setCurrentPage(Page.AUTH);
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

  const handleStartLogin = () => {
    if (!clientId) {
      setShowSetup(true);
    } else {
      setShowConsent(true);
    }
  };

  const handleConsentAllow = () => {
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
    if (user?.accessToken) {
      const q = `'${group.driveFolderId}' in parents and mimeType contains 'image/' and trashed=false`;
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,description,createdTime,thumbnailLink,webContentLink)`, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      const data = await res.json();
      const drivePosts: Post[] = (data.files || []).map((f: any) => ({
        id: f.id,
        userId: user.id,
        groupId: group.id,
        imageUrls: [f.thumbnailLink?.replace('=s220', '=s1000') || f.webContentLink],
        comment: f.description || "",
        timestamp: new Date(f.createdTime).getTime()
      }));
      setPosts(drivePosts);
    }
    setCurrentPage(Page.MAIN_FEED);
    setIsScanningDrive(false);
  };

  const handleUploadToDrive = async (post: Post, blobs: Blob[]) => {
    if (!user?.accessToken || !currentGroup) return;

    for (const blob of blobs) {
      const metadata = {
        name: `Moment_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        parents: [currentGroup.driveFolderId],
        description: post.comment
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', blob);

      try {
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webContentLink,thumbnailLink,createdTime,description', {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.accessToken}` },
          body: formData
        });
        const file = await res.json();
        
        const newPost: Post = {
          id: file.id,
          userId: user.id,
          groupId: currentGroup.id,
          imageUrls: [file.thumbnailLink?.replace('=s220', '=s1000') || file.webContentLink],
          comment: file.description || "",
          timestamp: new Date(file.createdTime).getTime()
        };
        setPosts(prev => [newPost, ...prev]);
      } catch (e) {
        console.error("Upload failed", e);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col relative overflow-hidden">
      {currentPage === Page.AUTH && <AuthPage onLogin={handleStartLogin} isConfigured={!!clientId} onOpenSetup={() => setShowSetup(true)} />}
      
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
          onAddPost={async (post) => {}}
          onRealUpload={handleUploadToDrive}
          onDeletePost={(id) => setPosts(posts.filter(p => p.id !== id))}
          onEditPost={(id, comment) => setPosts(posts.map(p => p.id === id ? {...p, comment} : p))}
          onLogout={handleLogout}
          onChangeGroup={() => setCurrentPage(Page.GROUP_SELECTION)}
          onDeleteGroup={() => {}} 
          onRenameGroup={() => {}} 
          onLeaveGroup={() => {}}
          onAddMember={() => {}}
          onRemoveMember={() => {}}
        />
      )}

      {/* --- OVERLAYS --- */}

      {/* 1. Project Setup Box */}
      {showSetup && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-indigo-600 text-white relative">
              <button onClick={() => setShowSetup(false)} className="absolute top-6 right-6 p-2 text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <Cloud className="w-10 h-10 mb-4" />
              <h2 className="text-2xl font-black tracking-tighter">Project Setup</h2>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">One-time configuration</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shrink-0 text-xs">1</div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900 leading-tight">Create a Google Cloud Project</p>
                  <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                    Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shrink-0 text-xs">2</div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-bold text-gray-900 leading-tight">Paste your Client ID</p>
                  <input 
                    type="text" 
                    placeholder="...apps.googleusercontent.com"
                    className="w-full mt-2 p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-mono focus:border-indigo-500 outline-none transition-all"
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        localStorage.setItem('sm_client_id', val);
                        setClientId(val);
                        setShowSetup(false);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 items-start border border-amber-100">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                  This ID is stored only on your phone. It allows SharedMoments to talk directly to YOUR private Drive.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Permission Consent Box (As Requested) */}
      {showConsent && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-indigo-600">
              <ShieldCheck className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-4">Allow Drive Access?</h2>
            
            <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed">
              SharedMoments needs permission to create and manage the <span className="text-indigo-600 font-black">SharedMoments</span> folder in your Google Drive. We never see your other files.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConsentAllow}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Allow & Sync
              </button>
              <button 
                onClick={() => {
                  setShowConsent(false);
                  // "Ignore will bring back the user to the first login screen"
                  // Handled by just closing the modal as we are already on AUTH page
                }}
                className="w-full py-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
