import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile, changePassword } from '../../services/authService';
import Button from '../../components/common/Button';

const ProfilesPage = () => {
  const { user, updateUser } = useAuth();

  // --- Profile State ---
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Password State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- Handle Profile Update ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!username || !email) {
      toast.error('Username and Email cannot be empty.');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedData = await updateProfile({ username, email });
      updateUser(updatedData.data || updatedData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Handle Password Change ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const inputClass = `w-full rounded-xl bg-[#0B2345]/60 py-3 pl-4 pr-10 text-base text-white outline-none transition-all duration-200 placeholder:text-[#CBD5E1]/60 backdrop-blur-sm border border-[rgba(255,255,255,0.08)] focus:border-[#FF8C32] focus:shadow-[0_0_15px_rgba(255,140,50,0.15)]`;

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
        <p className="mt-1 text-sm text-[#CBD5E1]">Manage your account settings and security.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        
        {/* LEFT CARD: General Information */}
        <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-lg border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/20">
          <h2 className="mb-6 text-lg font-bold text-white">General Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">Username</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="Your username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={isUpdating}
              className="mt-2 w-full justify-center"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </div>

        {/* RIGHT CARD: Change Password */}
        <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-lg border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/20">
          <h2 className="mb-6 text-lg font-bold text-white">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            
            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">Current Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`${inputClass} pl-12 pr-10`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#CBD5E1]/60 hover:text-white transition"
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputClass} pl-12 pr-10`}
                  placeholder="Enter new password (6+ chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#CBD5E1]/60 hover:text-white transition"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">Confirm New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pl-12 pr-10`}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#CBD5E1]/60 hover:text-white transition"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="secondary" 
              loading={isChangingPassword}
              className="mt-2 w-full justify-center border-[#FF8C32]/30 text-[#FF8C32] hover:bg-[#FF8C32]/10"
            >
              <Lock className="h-4 w-4" />
              Update Password
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilesPage;