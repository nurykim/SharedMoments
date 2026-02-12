
import React, { useState } from 'react';
import { User, Group } from '../types';
import { Plus, Users, ChevronRight, X, Folder, Cloud, Loader2, HardDrive } from 'lucide-react';

interface GroupSelectionPageProps {
  user: User;
  groups: Group[];
  onSelect: (group: Group) => void;
  onCreate: (name: string) => void;
  isLoading?: boolean;
}

const GroupSelectionPage: React.FC<GroupSelectionPageProps> = ({ user, groups, onSelect, onCreate, isLoading }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreate(newGroupName.trim());
      setNewGroupName('');
      setShowCreateModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 space-y-6">
        <div className="relative">
          <Cloud className="w-16 h-16 text-indigo-100 animate-pulse" />
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Syncing Google Drive</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Scanning SharedMoments folder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="px-6 py-8 border-b bg-white">
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <Cloud className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Connected to Drive</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">SharedMoments</h1>
        <p className="text-gray-400 text-xs mt-1 font-medium">Root: Google Drive / My Files / SharedMoments</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {groups.length > 0 ? (
          groups.map(group => (
            <button
              key={group.id}
              onClick={() => onSelect(group)}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group text-left active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <Folder className="w-6 h-6 fill-indigo-500/20" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{group.name}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                    {group.hostId === user.id ? 'Host' : 'Member'} • {group.memberEmails.length} Member{group.memberEmails.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <HardDrive className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">No Groups Found</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
              Create a sub-folder in SharedMoments to start sharing.
            </p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-xs tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Create New Group Folder
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 relative">
            <button 
              onClick={() => { setShowCreateModal(false); setNewGroupName(''); }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Create Folder</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Drive / SharedMoments / ...</p>
              </div>
            </div>
            
            <input
              autoFocus
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Wedding 2024"
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none mb-8 font-bold"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setNewGroupName(''); }}
                className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-black uppercase text-[10px] tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newGroupName.trim()}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSelectionPage;
