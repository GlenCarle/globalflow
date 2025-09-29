import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AGENT_ROUTES } from '../../constants/routes';
import { LogOut, User, FileText, Calendar, MessageSquare, Bell, Settings, ChevronDown } from 'lucide-react';

const AgentLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path) 
      ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(AGENT_ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { icon: <FileText className="h-5 w-5" />, label: 'Demandes', path: AGENT_ROUTES.APPLICATIONS },
    { icon: <Calendar className="h-5 w-5" />, label: 'Rendez-vous', path: AGENT_ROUTES.APPOINTMENTS },
    { icon: <User className="h-5 w-5" />, label: 'Clients', path: AGENT_ROUTES.CLIENTS },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Messages', path: AGENT_ROUTES.MESSAGES },
    { icon: <Bell className="h-5 w-5" />, label: 'Alertes', path: AGENT_ROUTES.ALERTS },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary dark:text-primary-300">Espace Agent</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${isActive(item.path)}`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/settings"
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/settings')}`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Paramètres
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {location.pathname === AGENT_ROUTES.DASHBOARD && 'Tableau de bord'}
              {(location.pathname === AGENT_ROUTES.APPLICATIONS || location.pathname.startsWith(AGENT_ROUTES.APPLICATIONS + '/')) && 'Gestion des demandes'}
              {location.pathname === AGENT_ROUTES.APPOINTMENTS && 'Rendez-vous'}
              {(location.pathname === AGENT_ROUTES.CLIENTS || location.pathname.startsWith(AGENT_ROUTES.CLIENTS + '/')) && 'Clients'}
              {location.pathname === AGENT_ROUTES.MESSAGES && 'Messages'}
              {location.pathname === AGENT_ROUTES.ALERTS && 'Alertes'}
            </h2>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-200">
                    {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.first_name || 'Profile'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${showProfileMenu ? 'transform rotate-180' : ''}`} />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AgentLayout;
