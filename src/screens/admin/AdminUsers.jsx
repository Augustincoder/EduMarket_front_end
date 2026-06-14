import { useState } from 'react';
import { filesApi } from '../../services/other.service';
import { toast } from 'react-hot-toast';

import { useAdminUsers } from './AdminUsers/hooks/useAdminUsers';
import { AdminUsersFilterBar } from './AdminUsers/components/AdminUsersFilterBar';
import { AdminUsersTable } from './AdminUsers/components/AdminUsersTable';
import { UserBanModal } from './AdminUsers/components/Modals/UserBanModal';
import { UserVipModal } from './AdminUsers/components/Modals/UserVipModal';
import { UserWarningModal } from './AdminUsers/components/Modals/UserWarningModal';
import { StudentVerificationModal } from './AdminUsers/components/Modals/StudentVerificationModal';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [vipFilter, setVipFilter] = useState('ALL');
  const [banFilter, setBanFilter] = useState('ALL');

  const [selectedUser, setSelectedUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'BAN' | 'VIP' | 'WARN' | 'STUDENT'
  const [studentCardUrl, setStudentCardUrl] = useState('');

  const closeModal = () => {
    setSelectedUser(null);
    setActiveModal(null);
    setStudentCardUrl('');
  };

  const {
    usersQuery,
    banMutation,
    vipMutation,
    warnMutation,
    studentMutation
  } = useAdminUsers({ search, roleFilter, vipFilter, banFilter, closeModal });

  const { data: users, isLoading } = usersQuery;

  const openStudentModal = async (user) => {
    setSelectedUser(user);
    setActiveModal('STUDENT');
    if (user.studentCardFileId) {
      const publicUrl = filesApi.getPublicUrl(user.studentCardFileId);
      if (publicUrl) {
        setStudentCardUrl(publicUrl);
        return;
      }
      try {
        const res = await filesApi.getUrl(user.studentCardFileId);
        setStudentCardUrl(res.data.data.url);
      } catch {
        toast.error('Guvohnoma faylini yuklab bo\'lmadi');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      <AdminUsersFilterBar 
        search={search} setSearch={setSearch}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        vipFilter={vipFilter} setVipFilter={setVipFilter}
        banFilter={banFilter} setBanFilter={setBanFilter}
        users={users}
      />

      <AdminUsersTable 
        users={users} 
        isLoading={isLoading}
        openStudentModal={openStudentModal}
        setSelectedUser={setSelectedUser}
        setActiveModal={setActiveModal}
        banMutation={banMutation}
      />

      <UserBanModal 
        isOpen={activeModal === 'BAN'} 
        onClose={closeModal} 
        selectedUser={selectedUser} 
        banMutation={banMutation} 
      />

      <UserVipModal 
        isOpen={activeModal === 'VIP'} 
        onClose={closeModal} 
        selectedUser={selectedUser} 
        vipMutation={vipMutation} 
      />

      <UserWarningModal 
        isOpen={activeModal === 'WARN'} 
        onClose={closeModal} 
        selectedUser={selectedUser} 
        warnMutation={warnMutation} 
      />

      <StudentVerificationModal 
        isOpen={activeModal === 'STUDENT'} 
        onClose={closeModal} 
        selectedUser={selectedUser} 
        studentMutation={studentMutation} 
        studentCardUrl={studentCardUrl}
      />

    </div>
  );
}
