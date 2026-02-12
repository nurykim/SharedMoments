
import React, { useState } from 'react';
import { User, Group } from '../types';
import { Plus, Users, ChevronRight, X } from 'lucide-react';

interface GroupSelectionPageProps {
  user: User;
  groups: Group[];
  onSelect: (group: Group) => void;
  onCreate: (name: string) => void;
}

const GroupSelectionPage: React.FC<GroupSelectionPageProps> = ({ user, groups, onSelect, onCreate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreate(newGroupName.trim());
      setNewGroupName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="px-6 py-8 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Your Groups</h1>
        <p className="text-gray-500 text-sm mt-1">Select a group to view memories</p>
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
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {group.hostId === user.id ? 'Host' : 'Member'} • {group.memberEmails.length} Members
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm">No groups yet. Create one below!</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 relative">
            <button 
              onClick={() => { setShowCreateModal(false); setNewGroupName(''); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-2">Name your group</h2>
            <p className="text-gray-500 text-sm mb-6">How should everyone call this group?</p>
            <input
              autoFocus
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Summer Vacation 2024"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setNewGroupName(''); }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newGroupName.trim()}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
