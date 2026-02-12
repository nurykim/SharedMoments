
import React, { useState, useEffect } from 'react';
import { Page, User, Group, Post } from './types';
import AuthPage from './components/AuthPage';
import GroupSelectionPage from './components/GroupSelectionPage';
import MainFeedPage from './components/MainFeedPage';

// Mock Data representing simulated Google Drive storage
const MOCK_USER: User = {
  id: 'google_102938',
  email: 'user@gmail.com',
  name: 'Google User',
  photoUrl: 'https://picsum.photos/seed/google/100/100'
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isScanningDrive, setIsScanningDrive] = useState(false);

  // Simulate Drive Sync on Login
  useEffect(() => {
    const savedUser = localStorage.getItem('shared_moments_user');
    const remembered = localStorage.getItem('shared_moments_remember') === 'true';
    if (remembered && savedUser) {
      handleUserReady(JSON.parse(savedUser));
    }
  }, []);

  const handleUserReady = (userData: User) => {
    setUser(userData);
    setIsScanningDrive(true);
    setCurrentPage(Page.GROUP_SELECTION);
    
    // Simulate finding the "SharedMoments" folder and its children
    setTimeout(() => {
      const savedGroups = localStorage.getItem(`drive_folders_${userData.id}`);
      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      } else {
        // Initial empty state: Ensure the root folder "SharedMoments" exists logically
        setGroups([]);
      }
      setIsScanningDrive(false);
    }, 1500);
  };

  const handleLogin = (remember: boolean) => {
    if (remember) {
      localStorage.setItem('shared_moments_remember', 'true');
      localStorage.setItem('shared_moments_user', JSON.stringify(MOCK_USER));
    }
    handleUserReady(MOCK_USER);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentGroup(null);
    localStorage.removeItem('shared_moments_remember');
    localStorage.removeItem('shared_moments_user');
    setCurrentPage(Page.AUTH);
  };

  const createGroupFolder = (name: string) => {
    if (!user) return;
    const folderId = `folder_${Date.now()}`;
    const newGroup: Group = {
      id: folderId,
      name,
      hostId: user.id,
      memberEmails: [user.email],
      driveFolderId: folderId,
      path: `SharedMoments/${name}`
    };
    
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem(`drive_folders_${user.id}`, JSON.stringify(updatedGroups));
    
    setCurrentGroup(newGroup);
    setCurrentPage(Page.MAIN_FEED);
  };

  const selectGroup = (group: Group) => {
    setCurrentGroup(group);
    setCurrentPage(Page.MAIN_FEED);
  };

  const addMemberToFolder = (groupId: string, email: string) => {
    if (!user) return;
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return { ...g, memberEmails: [...g.memberEmails, email] };
      }
      return g;
    });
    setGroups(updated);
    localStorage.setItem(`drive_folders_${user.id}`, JSON.stringify(updated));
  };

  const deleteGroupFolder = (id: string) => {
    if (!user) return;
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated);
    localStorage.setItem(`drive_folders_${user.id}`, JSON.stringify(updated));
    setCurrentPage(Page.GROUP_SELECTION);
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
          posts={posts.filter(p => p.groupId === currentGroup.id)}
          onAddPost={(p) => setPosts([p, ...posts])}
          onDeletePost={(id) => setPosts(posts.filter(p => p.id !== id))}
          onEditPost={(id, comment) => setPosts(posts.map(p => p.id === id ? {...p, comment} : p))}
          onLogout={handleLogout}
          onChangeGroup={() => setCurrentPage(Page.GROUP_SELECTION)}
          onDeleteGroup={() => deleteGroupFolder(currentGroup.id)}
          onRenameGroup={(name) => {
            const updated = groups.map(g => g.id === currentGroup.id ? {...g, name} : g);
            setGroups(updated);
            localStorage.setItem(`drive_folders_${user.id}`, JSON.stringify(updated));
          }}
          onLeaveGroup={() => deleteGroupFolder(currentGroup.id)}
          onAddMember={(email) => addMemberToFolder(currentGroup.id, email)}
          onRemoveMember={(email) => {
             const updated = groups.map(g => g.id === currentGroup.id ? {...g, memberEmails: g.memberEmails.filter(e => e !== email)} : g);
             setGroups(updated);
             localStorage.setItem(`drive_folders_${user.id}`, JSON.stringify(updated));
          }}
        />
      )}
    </div>
  );
};

export default App;
