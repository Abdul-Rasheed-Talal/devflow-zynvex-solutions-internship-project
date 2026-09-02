import { useState } from 'react';
import { useTeamMembers } from '../../hooks/useTeamQueries';
import { useTeamWorkspaces, useCreateTeam, useAddTeamMember, useDeleteTeam } from '../../hooks/useTeamWorkspaceQueries';
import { useAuthStore } from '../../stores/authStore';
import { TeamMember as DirectoryMember } from '../../types/team';
import UserProfileModal from '../../components/team/UserProfileModal';
import { useNavigate } from 'react-router-dom';

export default function TeamPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'workspaces' | 'directory'>('workspaces');
  
  const { data: teamDirectories, isLoading: isLoadingDir, error: dirError } = useTeamMembers();
  const { data: globalTeams, isLoading: isLoadingTeams } = useTeamWorkspaces();
  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();
  const deleteTeamMutation = useDeleteTeam();

  const [selectedUser, setSelectedUser] = useState<DirectoryMember | null>(null);
  
  // Modals
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [teamCreateError, setTeamCreateError] = useState('');

  const [showAddMemberModal, setShowAddMemberModal] = useState<string | null>(null); // teamId
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addMemberError, setAddMemberError] = useState('');

  const [teamToDelete, setTeamToDelete] = useState<any | null>(null);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamCreateError('');
    try {
      await createTeamMutation.mutateAsync({ name: newTeamName });
      setShowCreateTeamModal(false);
      setNewTeamName('');
    } catch (err: any) {
      setTeamCreateError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddMemberModal) return;
    setAddMemberError('');
    try {
      await addMemberMutation.mutateAsync({ teamId: showAddMemberModal, email: newMemberEmail });
      setShowAddMemberModal(null);
      setNewMemberEmail('');
    } catch (err: any) {
      setAddMemberError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeamMutation.mutateAsync(teamToDelete._id);
      setTeamToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const isMaster = user?.email?.toLowerCase() === 'mabdulrasheedtalal@gmail.com';
  const isEnterprise = user?.accountType === 'company' || isMaster;
  const ownedTeamsCount = globalTeams?.filter(t => t.owner?._id === user?.id).length || 0;
  const hasReachedTeamLimit = user?.accountType === 'personal' && !isMaster && ownedTeamsCount >= 1;

  if (isLoadingDir || isLoadingTeams) {
    return <div className="p-8 text-center text-gray-500">Loading team data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Teams & Members</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your global workspaces and view project collaborators.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('workspaces')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'workspaces' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Global Workspaces
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'directory' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Project Directory
          </button>
        </div>
      </div>

      {activeTab === 'workspaces' && (
        <div className="space-y-6">
          {isEnterprise ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/80 p-4 rounded-lg border border-indigo-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-indigo-950">Enterprise Global Workspaces</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-600 text-white">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-xs text-indigo-700 mt-1">
                  Enterprise Workspace: You have unlimited teams, unlimited members, organization broadcasts, and full collaboration access.
                </p>
              </div>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
              >
                + Create Team
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Global Workspaces</h3>
                <p className="text-xs text-blue-700 mt-1">
                  {hasReachedTeamLimit
                    ? 'You have reached the personal account limit (1 team). Upgrade to Pro to create unlimited teams.'
                    : user?.accountType === 'personal' && !isMaster
                    ? 'Personal accounts can create 1 team (up to 12 members).'
                    : 'Business/Pro accounts can create unlimited teams with unlimited members.'}
                </p>
              </div>
              {hasReachedTeamLimit ? (
                <button
                  onClick={() => navigate('/app/upgrade')}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
                >
                  Upgrade to Pro for Unlimited Teams
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shrink-0"
                >
                  + Create Team
                </button>
              )}
            </div>
          )}

          {globalTeams?.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
              You don't have any global teams yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {globalTeams?.map((team) => (
                <div key={team._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-medium text-gray-900">{team.name}</h2>
                      {isEnterprise && (
                        <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                          Enterprise
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        Owner: {team.owner.name}
                      </span>
                      {(team.owner._id === user?.id || isMaster) && (
                        <button
                          onClick={() => setTeamToDelete(team)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          Delete Team
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Members ({team.members.length + 1})</h3>
                      {(team.owner._id === user?.id || isMaster) && (
                        <button
                          onClick={() => setShowAddMemberModal(team._id)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          + Add Member
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {/* Render Owner */}
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                          {team.owner.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{team.owner.name} (Owner)</span>
                      </div>
                      
                      {/* Render Members */}
                      {team.members.map((m) => (
                        <div key={m.user._id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                            {m.user.name.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-700">{m.user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="space-y-6">
          {dirError && <div className="text-red-600">Failed to load directory.</div>}
          
          {teamDirectories?.length === 0 && (
            <div className="py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
              No project collaborators found. Start adding people to your projects!
            </div>
          )}

          {teamDirectories?.map((directory) => (
            <div key={directory.projectId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="text-blue-600 mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </span>
                  {directory.projectName}
                </h2>
                <span className="text-xs font-medium bg-white text-gray-600 px-2 py-1 rounded border border-gray-200 uppercase">
                  My Role: {directory.myRole}
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {directory.members.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedUser(member)}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative min-w-0"
                    >
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {member.projectRole}
                      </span>
                      
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover mb-3 shrink-0 border border-gray-100" />
                      ) : (
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-lg sm:text-xl font-bold mb-3 shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      
                      <h3 className="text-sm font-semibold text-gray-900 truncate max-w-full w-full px-1">
                        {member.name}
                      </h3>
                      
                      {member.email ? (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-full w-full px-1" title={member.email}>
                          {member.email}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1 italic">Private (Requires Admin)</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create Global Team</h2>
            {teamCreateError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                {teamCreateError}
                {teamCreateError.includes('Upgrade to Pro') && (
                  <button onClick={() => navigate('/app/upgrade')} className="block mt-2 underline font-medium">Upgrade Account</button>
                )}
              </div>
            )}
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Frontend Developers"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateTeamModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border rounded">Cancel</button>
                <button type="submit" disabled={createTeamMutation.isPending} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h2>
            {addMemberError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                {addMemberError}
                {addMemberError.includes('Upgrade to Business') && (
                  <button onClick={() => navigate('/app/upgrade')} className="block mt-2 underline font-medium">Upgrade Account</button>
                )}
              </div>
            )}
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Email</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddMemberModal(null)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border rounded">Cancel</button>
                <button type="submit" disabled={addMemberMutation.isPending} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Team Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Team</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong className="text-gray-900">{teamToDelete.name}</strong>? This will remove the team workspace and unassign its grouping.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteTeamMutation.isPending}
                onClick={handleDeleteTeam}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
              >
                {deleteTeamMutation.isPending ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
