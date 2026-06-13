import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Menu, ChevronDown, Settings, HelpCircle } from 'lucide-react';

function Header({ onMenuToggle }) {
  const { user, userType, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const [showProfile, setShowProfile] = useState(false);

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowUserDropdown(false);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={onMenuToggle}
                className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="h-10 w-10 relative rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">RT</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">RationTrack</h1>
                  <p className="text-sm text-slate-400">Admin Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4">
                
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl pl-1 pr-4 py-1 transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-medium shadow-md">
                    {user?.fullName ? user.fullName.charAt(0) : user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">
                      {user?.fullName || user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-slate-300 capitalize flex items-center">
                      {userType} {user?.shop && `• ${user.shop.shopName}`}
                      <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                    </p>
                  </div>
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-lg py-2 border border-slate-700/50 z-10 backdrop-blur-sm">
                    <div className="px-4 py-2 border-b border-slate-700/30">
                      <p className="text-sm font-medium">Signed in as</p>
                      <p className="text-sm text-slate-300 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors duration-150 flex items-center"
                        onClick={handleProfileClick}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Your Profile
                      </button>
                    </div>
                    
                    <div className="border-t border-slate-700/30 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/20 text-red-300 hover:text-red-100 transition-colors duration-150 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={handleCloseProfile}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">User Profile</h2>
            <div className="flex flex-col gap-2 text-slate-700">
              <div>
                <span className="font-semibold">Name:</span> {user?.fullName || user?.name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {user?.email || 'N/A'}
              </div>
              {user?.shop && (
                <div>
                  <span className="font-semibold">Shop:</span> {user.shop.shopName}
                </div>
              )}
              <div>
                <span className="font-semibold">Role:</span> {userType}
              </div>
              {/* Add more user details here as needed */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;