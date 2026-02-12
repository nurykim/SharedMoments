
import React, { useState, useMemo, useRef } from 'react';
import { User, Group, Post } from '../types';
import { Settings, Users, Plus, X, Trash2, Edit3, LogOut, UserMinus, Send, Folder, Smartphone, Cloud, Loader2, HardDrive, ChevronLeft, ChevronRight, Upload, Github, Image as ImageIcon } from 'lucide-react';

interface MainFeedPageProps {
  user: User;
  group: Group;
  posts: Post[];
  onAddPost: (post: Post) => void;
  onRealUpload?: (post: Post, blobs: Blob[]) => Promise<void>;
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
  const { user, group, posts, onRealUpload, onDeletePost, onEditPost, onLogout, onChangeGroup, onDeleteGroup, onRenameGroup, onLeaveGroup, onAddMember, onRemoveMember } = props;
  
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
        <button onClick={() => setShowGroupActions(true)} className="flex flex-col items-center flex-1 mx-4 overflow-hidden text-center">
          <span className="font-extrabold text-gray-900 truncate w-full text-base tracking-tight">{group.name}</span>
          <div className="flex items-center gap-1 justify-center">
            <Cloud className="w-2 h-2 text-indigo-500 fill-indigo-500" />
            <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">Drive Connected</span>
          </div>
        </button>
        <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {groupedPosts.length > 0 ? (
          groupedPosts.map(([month, monthPosts]) => (
            <div key={month} className="mb-4">
              <div className="px-5 py-4 bg-gray-50/70 flex items-center gap-2">
                <div className="w-1 h-3 bg-indigo-600 rounded-full" />
                <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em]">{month}</h2>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                {monthPosts.map(post => (
                  <button key={post.id} onClick={() => setSelectedPost(post)} className="aspect-square relative overflow-hidden group active:scale-95 transition-transform bg-gray-100">
                    <img src={post.imageUrls[0]} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40"></div>
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
          onUpload={onRealUpload}
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

      <div className="flex-1 flex flex-col items-center justify-center relative p-4">
        <div className="relative w-full max-w-xl aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-black/20">
          <img src={post.imageUrls[currentIndex]} alt={`Post content`} className="w-full h-full object-contain" />
        </div>
      </div>
      
      <div className="bg-white rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom duration-500 max-w-2xl mx-auto w-full shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
               <ImageIcon className="w-5 h-5" />
             </div>
             <div className="flex flex-col">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Memory Shared</p>
               <p className="text-xs font-bold text-gray-900">{new Date(post.timestamp).toLocaleDateString()}</p>
             </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(!isEditing)} className={`p-3 rounded-xl transition-all ${isEditing ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
                <Edit3 className="w-5 h-5" />
              </button>
              <button onClick={() => { onDelete(post.id); onClose(); }} className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-4">
            <textarea autoFocus value={editComment} onChange={(e) => setEditComment(e.target.value)} className="w-full p-6 bg-gray-50 rounded-2xl border-none text-sm font-medium min-h-[100px]" />
            <button onClick={() => { onEdit(post.id, editComment); setIsEditing(false); }} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Update Story</button>
          </div>
        ) : (
          <p className="text-gray-800 text-base font-medium italic">{post.comment || "No story shared yet..."}</p>
        )}
      </div>
    </div>
  );
};

const CreatePostModal: React.FC<{user: User, group: Group, onClose: () => void, onUpload?: (post: Post, blobs: Blob[]) => Promise<void>}> = ({ user, group, onClose, onUpload }) => {
  const [selectedPhotos, setSelectedPhotos] = useState<{url: string, blob: Blob}[]>([]);
  const [comment, setComment] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        blob: file
      }));
      setSelectedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handlePost = async () => {
    if (selectedPhotos.length === 0 || !onUpload) return;
    setIsSyncing(true);
    const postStub: Post = {
      id: '', userId: user.id, groupId: group.id, imageUrls: [], comment, timestamp: Date.now()
    };
    await onUpload(postStub, selectedPhotos.map(p => p.blob));
    setIsSyncing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
      <div className="p-6 border-b flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white">
             <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tighter">Save Memory</h2>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">{group.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-gray-300 hover:text-gray-900"><X className="w-7 h-7" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
        {isSyncing && (
           <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Uploading to Google Drive...</p>
           </div>
        )}
        
        {selectedPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-4 h-4" /> Choose Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {selectedPhotos.map((p, idx) => (
              <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden shadow-sm">
                <img src={p.url} className="w-full h-full object-cover" alt="Selected" />
              </div>
            ))}
            <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center text-indigo-400 bg-indigo-50/30">
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t space-y-6">
        <textarea placeholder="Tell the story behind these moments..." value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[2rem] border-none text-sm min-h-[120px] font-medium" />
        <button disabled={selectedPhotos.length === 0 || isSyncing} onClick={handlePost} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-50 text-[10px] tracking-widest uppercase flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Upload to Drive
        </button>
      </div>
    </div>
  );
};

// ... SettingsModal, MembersModal, AddMemberModal, GroupActionsModal, RenameModal, ConfirmModal (Rest unchanged) ...
const SettingsModal: React.FC<{onClose: () => void, onLogout: () => void, onChangeGroup: () => void}> = ({ onClose, onLogout, onChangeGroup }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-end justify-center p-4">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
      <h2 className="text-2xl font-black mb-6 tracking-tighter">My Settings</h2>
      <div className="space-y-3">
        <button onClick={onChangeGroup} className="w-full flex items-center gap-4 p-5 bg-indigo-50 rounded-2xl text-indigo-600 font-black"><Folder className="w-5 h-5" /> Change Group</button>
        <button onClick={onLogout} className="w-full flex items-center gap-4 p-5 bg-red-50 text-red-600 rounded-2xl font-black"><LogOut className="w-5 h-5" /> Logout</button>
        <button onClick={onClose} className="w-full p-5 mt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Close</button>
      </div>
    </div>
  </div>
);

const MembersModal: React.FC<{group: Group, isHost: boolean, onClose: () => void, onAdd: () => void, onRemove: (e: string) => void}> = ({ group, isHost, onClose, onAdd, onRemove }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] relative">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400"><X className="w-5 h-5" /></button>
      <div className="p-8 border-b">
        <h2 className="text-2xl font-black tracking-tighter">Group Members</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
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
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400"><X className="w-5 h-5" /></button>
        <h3 className="text-2xl font-black mb-2 tracking-tighter">Invite Member</h3>
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
      <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400"><X className="w-5 h-5" /></button>
      <p className="text-center text-[9px] font-black uppercase text-gray-300 tracking-widest mb-6">Drive Management</p>
      {isHost ? (
        <>
          <button onClick={onRename} className="w-full p-5 bg-indigo-50 text-indigo-600 rounded-2xl font-black">Rename Folder</button>
          <button onClick={onDelete} className="w-full p-5 bg-red-50 text-red-600 rounded-2xl font-black">Delete All Content</button>
        </>
      ) : (
        <button onClick={onLeave} className="w-full p-5 bg-red-50 text-red-600 rounded-2xl font-black">Leave Shared Drive</button>
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
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400"><X className="w-5 h-5" /></button>
        <h3 className="text-xl font-black mb-6">Rename Folder</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-5 bg-gray-100 rounded-2xl mb-8 font-black" />
        <button onClick={() => onRename(name)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Save</button>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<{type: 'delete' | 'leave', onClose: () => void, onConfirm: () => void}> = ({ type, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-[70] bg-red-600/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-white text-center relative">
    <button onClick={onClose} className="absolute top-10 right-10 p-4 text-white/60"><X className="w-8 h-8" /></button>
    <h2 className="text-6xl font-black mb-6 italic tracking-tighter">DANGER</h2>
    <p className="text-xl font-bold mb-12 opacity-80">{type === 'delete' ? 'This removes ALL photos from your Google Drive folder!' : 'You will lose access to these shared memories.'}</p>
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <button onClick={onConfirm} className="py-6 bg-white text-red-600 rounded-[2.5rem] font-black text-xl transition-all active:scale-95">PROCEED</button>
      <button onClick={onClose} className="py-4 font-black border-2 border-white/20 rounded-[2.5rem] transition-all active:scale-95">ABORT</button>
    </div>
  </div>
);

export default MainFeedPage;
