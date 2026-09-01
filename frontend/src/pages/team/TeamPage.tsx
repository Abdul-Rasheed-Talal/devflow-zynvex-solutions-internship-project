import React, { useState } from 'react';
import { useTeamMembers } from '../../hooks/useTeamQueries';
import { TeamMember } from '../../types/team';
import UserProfileModal from '../../components/team/UserProfileModal';

export default function TeamPage() {
  const { data: teamMembers, isLoading, error } = useTeamMembers();
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading team members...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Failed to load team directory.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Team Directory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Everyone involved across your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teamMembers?.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedUser(member)}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
          >
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="h-16 w-16 rounded-full object-cover mb-4" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold mb-4">
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1">
              {member.name}
              {member.accountType === 'company' && (
                <span className="text-blue-500" title="Verified Company Account">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{member.email}</p>
            
            {member.skills && member.skills.length > 0 && (
              <div className="mt-3 text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded">
                {member.skills[0]} {member.skills.length > 1 && `+${member.skills.length - 1}`}
              </div>
            )}
          </div>
        ))}

        {teamMembers?.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            No team members found. Start adding people to your projects!
          </div>
        )}
      </div>

      <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
