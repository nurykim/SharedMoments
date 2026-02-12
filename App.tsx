
import React, { useState, useEffect, useCallback } from 'react';
import { Page, User, Group, Post, Invitation } from './types';
import AuthPage from './components/AuthPage';
import GroupSelectionPage from './components/GroupSelectionPage';
import MainFeedPage from './components/MainFeedPage';

// Mock Data Initializers representing Google Drive state
const MOCK_USER: User = {
  id: 'google_102938',
  email: 'user@gmail.com',
  name: 'Google User',
  photoUrl: 'https://picsum.photos/seed/google/100/100'
};

const INITIAL_GROUPS: Group[] = [
  { id: 'drive_f_001', name: 'Family Memories', hostId: 'google_102938', memberEmails: ['user@gmail.com', 'family@gmail.com'] }
];

const INITIAL_POSTS: Post[] = [
  { id: 'drive_i_001', userId: 'google_102938', groupId: 'drive_f_001', imageUrls: ['https://picsum.photos/id/11/800/800'], comment: 'Cloud backup synced!', timestamp: Date.now() },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  useEffect(() => {
    const savedUser = localStorage.getItem('shared_moments_user');
    const remembered = localStorage.getItem('shared_moments_remember') === 'true';
    if (remembered && savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage(Page.GROUP_SELECTION);
    }
  }, []);

  const handleLogin = (remember: boolean) => {
    setUser(MOCK_USER);
    if (remember) {
      localStorage.setItem('shared_moments_remember', 'true');
      localStorage.setItem('shared_moments_user', JSON.stringify(MOCK_USER));
    }
    setCurrentPage(Page.GROUP_SELECTION);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentGroup(null);
    localStorage.removeItem('shared_moments_remember');
    localStorage.removeItem('shared_moments_user');
    setCurrentPage(Page.AUTH);
  };

  const createGroup = (name: string) => {
    if (!user) return;
    // Simulation: Creates a folder and a .shared_moments_config.json file in user's Drive
    const newGroup: Group = {
      id: `drive_f_${Date.now()}`,
      name,
      hostId: user.id,
      memberEmails: [user.email],
      configDriveFileId: `config_${Date.now()}.json`
    };
    setGroups([...groups, newGroup]);
    setCurrentGroup(newGroup);
    setCurrentPage(Page.MAIN_FEED);
  };

  const selectGroup = (group: Group) => {
    setCurrentGroup(group);
    setCurrentPage(Page.MAIN_FEED);
  };

  const addMember = (groupId: string, email: string) => {
    // Simulation: Updates the private config file in the creator's Drive
    setGroups(groups.map(g => {
      if (g.id === groupId && g.hostId === user?.id) {
        return { ...g, memberEmails: [...g.memberEmails, email] };
      }
      return g;
    }));
  };

  // Remaining CRUD handlers... (simplified for brevity)
  const deleteGroup = (id: string) => { setGroups(groups.filter(g => g.id !== id)); setCurrentPage(Page.GROUP_SELECTION); };
  const renameGroup = (id: string, name: string) => setGroups(groups.map(g => g.id === id ? {...g, name} : g));
  const removeMember = (id: string, email: string) => setGroups(groups.map(g => g.id === id ? {...g, memberEmails: g.memberEmails.filter(e => e !== email)} : g));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col relative overflow-hidden">
      {currentPage === Page.AUTH && <AuthPage onLogin={handleLogin} />}
      {currentPage === Page.GROUP_SELECTION && user && <GroupSelectionPage user={user} groups={groups} onSelect={selectGroup} onCreate={createGroup} />}
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
          onDeleteGroup={() => deleteGroup(currentGroup.id)}
          onRenameGroup={(name) => renameGroup(currentGroup.id, name)}
          onLeaveGroup={() => deleteGroup(currentGroup.id)}
          onAddMember={(email) => addMember(currentGroup.id, email)}
          onRemoveMember={(email) => removeMember(currentGroup.id, email)}
        />
      )}
    </div>
  );
};

export default App;
