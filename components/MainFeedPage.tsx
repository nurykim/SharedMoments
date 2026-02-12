
import React, { useState, useMemo, useRef } from 'react';
import { User, Group, Post } from '../types';
import { Settings, Users, Plus, X, Trash2, Edit3, LogOut, UserMinus, Send, Folder, Smartphone, Cloud, Loader2, HardDrive, ChevronLeft, ChevronRight, Upload, Github, Image as ImageIcon, CheckCircle, AlertCircle, MoreHorizontal, UserPlus, ImagePlus, MoreVertical, Share2 } from 'lucide-react';

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
  const [showConfirmModal, setShowConfirmModal] = useState<{type: 'delete' | 'leave', visible: boolean}>({
    type: 'delete',
    visible: false
  });

  const [isUploading, setIsUploading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      setSelectedFiles(filesArray);
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !onRealUpload) return;
    
    setIsUploading(true);
    try {
      const tempPost: Post = {
        id: Date.now().toString(),
        userId: user.id,
        groupId: group.id,
        imageUrls: [],
        comment: newComment,
        timestamp: Date.now()
      };
      
      await onRealUpload(tempPost, selectedFiles);
      
      setShowCreatePost(false);
      setNewComment('');
      setSelectedFiles([]);
      setPreviews([]);
    } catch (error) {
      alert("Upload failed. Please check your Drive connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative h-screen overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onChangeGroup}
            className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 transition-colors active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">{group.name}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">Shared Drive</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowMembers(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 active:scale-90 transition-all"
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 active:scale-90 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No Moments Yet</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
              Be the first to share a memory in this group.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 p-1">
            {posts.map((post) => (
              <button 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="aspect-square relative group overflow-hidden bg-slate-200 active:scale-[0.98] transition-transform"
              >
                <img 
                  src={post.imageUrls[0]} 
                  alt={post.comment} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                {post.comment && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left">
                    <p className="text-[10px] text-white font-bold line-clamp-1 opacity-90">{post.comment}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center active:scale-90 transition-all z-40 hover:bg-indigo-700"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
          <header className="px-6 py-6 flex items-center justify-between text-white border-b border-white/10">
            <button onClick={() => setShowCreatePost(false)} className="p-2 -ml-2 opacity-60 hover:opacity-100"><X /></button>
            <h2 className="text-lg font-black tracking-tighter uppercase tracking-widest text-[10px]">New Moment</h2>
            <button 
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="px-6 py-2 bg-white text-indigo-600 rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Share"}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {previews.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {previews.map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-white/5 relative">
                    <img src={url} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => {
                        const newFiles = [...selectedFiles];
                        newFiles.splice(idx, 1);
                        setSelectedFiles(newFiles);
                        const newPreviews = [...previews];
                        newPreviews.splice(idx, 1);
                        setPreviews(newPreviews);
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/40 rounded-full text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white/60 transition-colors"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add More</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-white/40 group hover:border-white/20 transition-all"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="font-black text-xs uppercase tracking-widest">Select Photos from Device</p>
              </button>
            )}

            <textarea 
              placeholder="Write a caption..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-transparent text-white text-xl font-medium outline-none placeholder:text-white/20 resize-none min-h-[120px]"
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
            <button onClick={() => setSelectedPost(null)} className="p-2 -ml-2 opacity-80"><X /></button>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (confirm("Delete this memory from Drive?")) {
                    onDeletePost(selectedPost.id);
                    setSelectedPost(null);
                  }
                }}
                className="p-2 opacity-60 hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <img src={selectedPost.imageUrls[0]} className="max-w-full max-h-full object-contain" />
          </div>

          <div className="p-8 bg-white rounded-t-[2.5rem] mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                  {user.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">{user.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {new Date(selectedPost.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-900"><Share2 className="w-5 h-5" /></button>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">{selectedPost.comment || "No caption provided."}</p>
          </div>
        </div>
      )}

      {/* Settings Side Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black tracking-tighter">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 text-slate-400 hover:text-slate-900"><X /></button>
              </div>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                  {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <div className="text-2xl font-black">{user.name[0]}</div>}
                </div>
                <div>
                  <p className="font-black text-slate-900 tracking-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[120px]">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button 
                onClick={() => { setShowSettings(false); setShowMembers(true); }}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group"
              >
                <Users className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                <span className="font-bold text-slate-600 group-hover:text-slate-900">Manage Group Members</span>
              </button>
              <button 
                onClick={() => setShowGroupActions(true)}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group"
              >
                <Folder className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                <span className="font-bold text-slate-600 group-hover:text-slate-900">Folder Actions</span>
              </button>
            </div>

            <div className="p-8 border-t space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <Cloud className="w-5 h-5 text-indigo-500" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Google Drive Connected</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b bg-indigo-600 text-white relative">
              <button onClick={() => setShowMembers(false)} className="absolute top-6 right-6 opacity-60"><X /></button>
              <h3 className="text-xl font-black tracking-tighter">Group Members</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">SharedMoments Access List</p>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto no-scrollbar">
              {group.memberEmails.map((email, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                      {email[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{email}</span>
                  </div>
                  {email === user.email ? (
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">You</span>
                  ) : (
                    <button className="text-red-400 p-1"><UserMinus className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-[0.98]">
                <UserPlus className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Invite via Drive</span>
              </button>
            </div>
            <div className="p-6 bg-slate-50/50">
              <button 
                onClick={() => setShowMembers(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Actions Bottom Sheet */}
      {showGroupActions && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-end animate-in fade-in duration-300" onClick={() => setShowGroupActions(false)}>
          <div className="w-full bg-white rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-8" />
            <h3 className="text-xl font-black tracking-tighter mb-6">Folder Management</h3>
            <div className="space-y-3">
              <button 
                onClick={() => { setShowGroupActions(false); setShowRenameModal(true); }}
                className="w-full flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] hover:bg-slate-100 transition-all text-left"
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Rename Group</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Update Drive Folder Name</p>
                </div>
              </button>
              
              <button 
                onClick={() => { setShowGroupActions(false); setShowConfirmModal({type: 'leave', visible: true}); }}
                className="w-full flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] hover:bg-slate-100 transition-all text-left"
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Leave Group</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Stop syncing this folder</p>
                </div>
              </button>

              <button 
                onClick={() => { setShowGroupActions(false); setShowConfirmModal({type: 'delete', visible: true}); }}
                className="w-full flex items-center gap-4 p-5 bg-red-50 rounded-[2rem] hover:bg-red-100 transition-all text-left group"
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-red-900">Delete Permanently</p>
                  <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Move folder to Drive Trash</p>
                </div>
              </button>
            </div>
            <button 
              onClick={() => setShowGroupActions(false)}
              className="w-full py-5 text-slate-300 font-black text-xs uppercase tracking-widest mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-[130] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl font-black tracking-tighter mb-2">Rename Folder</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 leading-relaxed">Changes name in your Google Drive too.</p>
            <input 
              autoFocus
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold mb-8"
              defaultValue={group.name}
              onKeyDown={(e) => {
                if(e.key === 'Enter') {
                  onRenameGroup(e.currentTarget.value);
                  setShowRenameModal(false);
                }
              }}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRenameModal(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
              <button 
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  onRenameGroup(input.value);
                  setShowRenameModal(false);
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal.visible && (
        <div className="fixed inset-0 z-[140] bg-slate-900/95 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className={`w-16 h-16 rounded-3xl mx-auto mb-6 flex items-center justify-center ${showConfirmModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-4">Are you sure?</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
              {showConfirmModal.type === 'delete' 
                ? "This will move the entire folder and all shared photos to your Google Drive trash."
                : "You will no longer see updates from this folder, but photos will remain in Drive."}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  if(showConfirmModal.type === 'delete') onDeleteGroup();
                  else onLeaveGroup();
                  setShowConfirmModal({type: 'delete', visible: false});
                }}
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl ${showConfirmModal.type === 'delete' ? 'bg-red-500 shadow-red-100' : 'bg-amber-500 shadow-amber-100'}`}
              >
                Confirm {showConfirmModal.type === 'delete' ? "Delete" : "Leave"}
              </button>
              <button 
                onClick={() => setShowConfirmModal({type: 'delete', visible: false})}
                className="w-full py-4 text-slate-300 font-bold text-[10px] uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainFeedPage;
