import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ADMIN_ROUTES } from '../../constants/routes';
import { Button } from '../ui/Button';
import { LogOut, User, Users, FileText, Settings, BarChart2, Shield } from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'bg-gray-100 text-primary' : 'text-gray-700';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ADMIN_ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Tableau de bord', path: ADMIN_ROUTES.DASHBOARD },
    { icon: <Users className="h-5 w-5" />, label: 'Utilisateurs', path: ADMIN_ROUTES.USERS },
    { icon: <Shield className="h-5 w-5" />, label: 'Agents', path: ADMIN_ROUTES.AGENTS },
    { icon: <FileText className="h-5 w-5" />, label: 'Services', path: ADMIN_ROUTES.SERVICES },
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Rapports', path: ADMIN_ROUTES.REPORTS },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">Administration</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${isActive(item.path)} hover:bg-gray-100`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate(ADMIN_ROUTES.SETTINGS)}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(ADMIN_ROUTES.SETTINGS) ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Paramètres
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 mt-1"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
