
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Group, Post, DriveItem } from '../types';
import { Settings, Users, Plus, X, Trash2, Edit3, LogOut, RefreshCcw, UserMinus, Send, Folder, Smartphone, Cloud, Search, Loader2, HardDrive, ChevronLeft, ChevronRight, Upload, Github, Image as ImageIcon } from 'lucide-react';

interface MainFeedPageProps {
  user: User;
  group: Group;
  posts: Post[];
  onAddPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, comment: string) => void;
  onLogout: () => void;
  onChangeGroup: () => void;
  onDeleteGroup: () => void;
  onRenameGroup: (name: string) => void;
  onLeaveGroup: () => void;
  onAddMember: (email: string) => void;
  onRemoveMember: (email: string) => void;
}

const MainFeedPage: React.FC<MainFeedPageProps> = (props) => {
  const { user, group, posts, onAddPost, onDeletePost, onEditPost, onLogout, onChangeGroup, onDeleteGroup, onRenameGroup, onLeaveGroup, onAddMember, onRemoveMember } = props;
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showGroupActions, setShowGroupActions] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{type: 'delete' | 'leave', visible: boolean}>({type: 'delete', visible: false});
  const [showAddMember, setShowAddMember] = useState(false);

  const groupedPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => b.timestamp - a.timestamp);
    const groups: { [key: string]: Post[] } = {};
    sorted.forEach(post => {
      const date = new Date(post.timestamp);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(post);
    });
    return Object.entries(groups);
  }, [posts]);

  const isHost = group.hostId === user.id;

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b flex items-center justify-between px-4 py-3">
        <button onClick={() => setShowMembers(true)} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <Users className="w-6 h-6" />
        </button>
        <button onClick={() => setShowGroupActions(true)} className="flex flex-col items-center flex-1 mx-4 overflow-hidden">
          <span className="font-extrabold text-gray-900 truncate w-full text-center text-base tracking-tight">{group.name}</span>
          <div className="flex items-center gap-1">
            <Cloud className="w-2 h-2 text-indigo-500 fill-indigo-500" />
            <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">Shared Drive Active</span>
          </div>
        </button>
        <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {groupedPosts.length > 0 ? (
          groupedPosts.map(([month, monthPosts]) => (
            <div key={month} className="mb-2">
              <div className="px-6 py-4 sticky top-[56px] bg-white/95 z-20 backdrop-blur-md border-b border-gray-100 flex items-center gap-2">
                <div className="w-1 h-3 bg-indigo-600 rounded-full" />
                <h2 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{month}</h2>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                {monthPosts.map(post => (
                  <button key={post.id} onClick={() => setSelectedPost(post)} className="aspect-square relative overflow-hidden group active:scale-95 transition-transform">
                    <img src={post.imageUrls[0]} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                    {post.imageUrls.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-black border border-white/10">
                        {post.imageUrls.length}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-gray-200">
            <HardDrive className="w-20 h-20 mb-4 opacity-10" />
            <p className="font-black uppercase tracking-tighter text-gray-400">Empty Shared Folder</p>
          </div>
        )}
      </main>

      <button onClick={() => setShowCreatePost(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40">
        <Plus className="w-10 h-10" />
      </button>

      {/* Detail & Modal Components */}
      {selectedPost && <PostDetailModal post={selectedPost} currentUserId={user.id} onClose={() => setSelectedPost(null)} onDelete={onDeletePost} onEdit={onEditPost} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onLogout={onLogout} onChangeGroup={onChangeGroup} />}
      {showMembers && <MembersModal group={group} isHost={isHost} onClose={() => setShowMembers(false)} onAdd={() => setShowAddMember(true)} onRemove={onRemoveMember} />}
      {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} onSend={(email) => { onAddMember(email); setShowAddMember(false); }} />}
      {showGroupActions && <GroupActionsModal isHost={isHost} onClose={() => setShowGroupActions(false)} onRename={() => { setShowRenameModal(true); setShowGroupActions(false); }} onDelete={() => { setShowConfirmModal({type: 'delete', visible: true}); setShowGroupActions(false); }} onLeave={() => { setShowConfirmModal({type: 'leave', visible: true}); setShowGroupActions(false); }} />}
      {showRenameModal && <RenameModal initialName={group.name} onClose={() => setShowRenameModal(false)} onRename={(name) => { onRenameGroup(name); setShowRenameModal(false); }} />}
      {showConfirmModal.visible && <ConfirmModal type={showConfirmModal.type} onClose={() => setShowConfirmModal({...showConfirmModal, visible: false})} onConfirm={() => { if (showConfirmModal.type === 'delete') onDeleteGroup(); else onLeaveGroup(); }} />}

      {showCreatePost && (
        <CreatePostModal 
          user={user}
          group={group}
          onClose={() => setShowCreatePost(false)}
          onPost={(post) => { onAddPost(post); setShowCreatePost(false); }}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const PostDetailModal: React.FC<{
  post: Post;
  currentUserId: string;
  onClose: () => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string, comment: string) => void;
}> = ({ post, currentUserId, onClose, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState(post.comment);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isOwner = post.userId === currentUserId;

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < post.imageUrls.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
    touchStartX.current = null;
  };

  const nextImg = () => {
    if (currentIndex < post.imageUrls.length - 1) setCurrentIndex(prev => prev + 1);
  };
  const prevImg = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300 overflow-hidden">
      <div className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between">
         <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
              {currentIndex + 1} / {post.imageUrls.length}
            </span>
         </div>
         <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
            <X className="w-6 h-6" />
         </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative touch-none" 
           onTouchStart={handleTouchStart} 
           onTouchEnd={handleTouchEnd}>
        
        {currentIndex > 0 && (
          <button onClick={prevImg} className="absolute left-4 z-40 p-4 bg-black/20 text-white rounded-full backdrop-blur-sm hidden md:flex">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < post.imageUrls.length - 1 && (
          <button onClick={nextImg} className="absolute right-4 z-40 p-4 bg-black/20 text-white rounded-full backdrop-blur-sm hidden md:flex">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-black/20">
            <img 
              src={post.imageUrls[currentIndex]} 
              alt={`Post content ${currentIndex + 1}`} 
              className="w-full h-full object-contain transition-all duration-500 ease-out" 
            />
          </div>
        </div>

        {post.imageUrls.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-40">
            {post.imageUrls.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'}`} 
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom duration-500 max-w-2xl mx-auto w-full shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
               <Users className="w-5 h-5" />
             </div>
             <div className="flex flex-col">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Shared Memory</p>
               <p className="text-xs font-bold text-gray-900">{new Date(post.timestamp).toLocaleDateString()}</p>
             </div>
          </div>
          
          {isOwner && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`p-3 rounded-xl transition-all active:scale-95 ${isEditing ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { onDelete(post.id); onClose(); }} 
                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea 
              autoFocus
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="w-full p-6 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-medium min-h-[100px]"
            />
            <button 
              onClick={() => { onEdit(post.id, editComment); setIsEditing(false); }} 
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100"
            >
              Update Story
            </button>
          </div>
        ) : (
          <div className="max-h-32 overflow-y-auto no-scrollbar">
            <p className="text-gray-800 text-base font-medium leading-relaxed italic">
              {post.comment || "No story shared yet..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const CreatePostModal: React.FC<{user: User, group: Group, onClose: () => void, onPost: (post: Post) => void}> = ({ user, group, onClose, onPost }) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsSyncing(true);
      setTimeout(() => {
        const urls = Array.from(files).map(file => URL.createObjectURL(file));
        setSelectedPhotos(prev => [...prev, ...urls]);
        setIsSyncing(false);
      }, 800);
    }
  };

  const removePhoto = (url: string) => {
    setSelectedPhotos(prev => prev.filter(u => u !== url));
  };

  const handlePost = () => {
    if (selectedPhotos.length === 0) return;
    onPost({
      id: `p_${Date.now()}`,
      userId: user.id,
      groupId: group.id,
      imageUrls: selectedPhotos,
      comment,
      timestamp: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect} 
      />

      <div className="p-6 border-b flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
             <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tighter leading-none">Save Memory</h2>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">To: {group.path}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-gray-300 hover:text-gray-900 transition-colors">
          <X className="w-7 h-7" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-gray-50 relative">
        {isSyncing && (
           <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Uploading to Folder...</p>
           </div>
        )}
        
        {selectedPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
              <ImageIcon className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pick Moments</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-[200px] mx-auto">Select photos from your device to store in this group's cloud folder.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
              Choose Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {selectedPhotos.map((url, index) => (
              <div key={index} className="aspect-square relative group rounded-2xl overflow-hidden shadow-sm">
                <img src={url} className="w-full h-full object-cover" alt="Selected" />
                <button 
                  onClick={() => removePhoto(url)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center text-indigo-400 bg-indigo-50/30 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-[9px] font-black uppercase tracking-widest">Add More</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t space-y-6 shadow-[0_-15px_30px_rgba(0,0,0,0.03)]">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Description</label>
          <textarea 
            placeholder="Tell the story behind these moments..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-6 bg-gray-50 rounded-[2rem] border-none focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm min-h-[120px] shadow-inner font-medium"
          />
        </div>
        
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
          <button 
            disabled={selectedPhotos.length === 0}
            onClick={handlePost}
            className="flex-2 w-2/3 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Upload to Drive
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsModal: React.FC<{onClose: () => void, onLogout: () => void, onChangeGroup: () => void}> = ({ onClose, onLogout, onChangeGroup }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-end justify-center p-4">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-black mb-6 tracking-tighter">My Settings</h2>
      <div className="space-y-3">
        <button onClick={onChangeGroup} className="w-full flex items-center gap-4 p-5 bg-indigo-50 rounded-2xl text-indigo-600 font-black transition-all active:scale-[0.98]"><Folder className="w-5 h-5" /> Change Group</button>
        <button 
          onClick={() => window.open('https://github.com/nurykim/SharedMoments/', '_blank')}
          className="w-full flex items-center gap-4 p-5 bg-slate-50 text-slate-700 rounded-2xl font-black transition-all active:scale-[0.98]"
        >
          <Github className="w-5 h-5" /> View Source Code
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-4 p-5 bg-red-50 text-red-600 rounded-2xl font-black transition-all active:scale-[0.98]"><LogOut className="w-5 h-5" /> Logout</button>
        <button onClick={onClose} className="w-full p-5 mt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Close</button>
      </div>
    </div>
  </div>
);

const MembersModal: React.FC<{group: Group, isHost: boolean, onClose: () => void, onAdd: () => void, onRemove: (e: string) => void}> = ({ group, isHost, onClose, onAdd, onRemove }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] relative">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="p-8 border-b">
        <h2 className="text-2xl font-black tracking-tighter">Group Members</h2>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-1">Managed via Drive members.txt</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
        {group.memberEmails.map((email, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <span className="text-sm font-bold text-gray-700">{email}</span>
            {isHost && idx !== 0 && <button onClick={() => onRemove(email)} className="text-red-500"><UserMinus className="w-5 h-5" /></button>}
          </div>
        ))}
      </div>
      {isHost && (
        <div className="p-8 border-t">
          <button onClick={onAdd} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg shadow-indigo-100">Add via Email</button>
        </div>
      )}
    </div>
  </div>
);

const AddMemberModal: React.FC<{onClose: () => void, onSend: (email: string) => void}> = ({ onClose, onSend }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-3xl p-10 animate-in zoom-in duration-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-black mb-2 tracking-tighter">Invite Member</h3>
        <p className="text-xs text-gray-400 mb-6 font-bold uppercase tracking-widest">Access to shared Drive folder</p>
        <input autoFocus type="email" placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-5 bg-gray-100 rounded-2xl mb-8 outline-none font-black" />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold">Back</button>
          <button onClick={() => onSend(email)} disabled={!email.includes('@')} className="flex-2 w-2/3 py-4 bg-indigo-600 text-white rounded-2xl font-black">INVITE</button>
        </div>
      </div>
    </div>
  );
};

const GroupActionsModal: React.FC<{isHost: boolean, onClose: () => void, onRename: () => void, onDelete: () => void, onLeave: () => void}> = ({ isHost, onClose, onRename, onDelete, onLeave }) => (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
    <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-10 space-y-3 relative">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <p className="text-center text-[9px] font-black uppercase text-gray-300 tracking-widest mb-6">Drive Management</p>
      {isHost ? (
        <>
          <button onClick={onRename} className="w-full p-5 bg-indigo-50 text-indigo-600 rounded-2xl font-black transition-all active:scale-[0.98]">Rename Folder</button>
          <button onClick={onDelete} className="w-full p-5 bg-red-50 text-red-600 rounded-2xl font-black transition-all active:scale-[0.98]">Delete All Content</button>
        </>
      ) : (
        <button onClick={onLeave} className="w-full p-5 bg-red-50 text-red-600 rounded-2xl font-black transition-all active:scale-[0.98]">Leave Shared Drive</button>
      )}
      <button onClick={onClose} className="w-full pt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Back</button>
    </div>
  </div>
);

const RenameModal: React.FC<{initialName: string, onClose: () => void, onRename: (name: string) => void}> = ({ initialName, onClose, onRename }) => {
  const [name, setName] = useState(initialName);
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-black mb-6">Rename Folder</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-5 bg-gray-100 rounded-2xl mb-8 font-black" />
        <button onClick={() => onRename(name)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Save</button>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<{type: 'delete' | 'leave', onClose: () => void, onConfirm: () => void}> = ({ type, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-[70] bg-red-600/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-white text-center relative">
    <button 
      onClick={onClose}
      className="absolute top-10 right-10 p-4 text-white/60 hover:text-white transition-colors"
    >
      <X className="w-8 h-8" />
    </button>
    <h2 className="text-6xl font-black mb-6 italic tracking-tighter">DANGER</h2>
    <p className="text-xl font-bold mb-12 opacity-80">{type === 'delete' ? 'This removes ALL photos from your Google Drive folder!' : 'You will lose access to these shared memories.'}</p>
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <button onClick={onConfirm} className="py-6 bg-white text-red-600 rounded-[2.5rem] font-black text-xl transition-all active:scale-95">PROCEED</button>
      <button onClick={onClose} className="py-4 font-black border-2 border-white/20 rounded-[2.5rem] transition-all active:scale-95">ABORT</button>
    </div>
  </div>
);

export default MainFeedPage;
