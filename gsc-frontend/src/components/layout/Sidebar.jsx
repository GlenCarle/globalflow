import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  Briefcase, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  PlaneTakeoff,
  CreditCard,
  MessageSquare,
  Bell,
  FileCheck,
  UserCog
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  // Define navigation items based on user role
  const getNavItems = () => {
    const clientItems = [
      {
        title: 'Tableau de bord',
        icon: <Home className="h-5 w-5" />,
        href: '/dashboard',
      },
      {
        title: 'Mes demandes',
        icon: <FileText className="h-5 w-5" />,
        href: '/dashboard/applications',
      },
      {
        title: 'Mes réservations',
        icon: <PlaneTakeoff className="h-5 w-5" />,
        href: '/dashboard/bookings',
      },
      {
        title: 'Rendez-vous',
        icon: <Calendar className="h-5 w-5" />,
        href: '/dashboard/appointments',
      },
      {
        title: 'Mes documents',
        icon: <FileCheck className="h-5 w-5" />,
        href: '/dashboard/documents',
      },
      {
        title: 'Messagerie',
        icon: <MessageSquare className="h-5 w-5" />,
        href: '/dashboard/messages',
      },
      {
        title: 'Paiements',
        icon: <CreditCard className="h-5 w-5" />,
        href: '/dashboard/payments',
      },
      {
        title: 'Profil',
        icon: <Settings className="h-5 w-5" />,
        href: '/dashboard/profile',
      },
    ];

    const agentItems = [
      {
        title: 'Tableau de bord',
        icon: <Home className="h-5 w-5" />,
        href: '/agent',
      },
      {
        title: 'Dossiers clients',
        icon: <Briefcase className="h-5 w-5" />,
        href: '/agent/cases',
      },
      {
        title: 'Rendez-vous',
        icon: <Calendar className="h-5 w-5" />,
        href: '/agent/appointments',
      },
      {
        title: 'Clients',
        icon: <Users className="h-5 w-5" />,
        href: '/agent/clients',
      },
      {
        title: 'Messagerie',
        icon: <MessageSquare className="h-5 w-5" />,
        href: '/agent/messages',
      },
      {
        title: 'Alertes',
        icon: <Bell className="h-5 w-5" />,
        href: '/agent/alerts',
      },
    ];

    const adminItems = [
      {
        title: 'Tableau de bord',
        icon: <Home className="h-5 w-5" />,
        href: '/admin',
      },
      {
        title: 'Utilisateurs',
        icon: <Users className="h-5 w-5" />,
        href: '/admin/users',
      },
      {
        title: 'Agents',
        icon: <UserCog className="h-5 w-5" />,
        href: '/admin/agents',
      },
      {
        title: 'Services',
        icon: <Briefcase className="h-5 w-5" />,
        href: '/admin/services',
      },
      {
        title: 'Rapports',
        icon: <FileText className="h-5 w-5" />,
        href: '/admin/reports',
      },
      {
        title: 'Paramètres',
        icon: <Settings className="h-5 w-5" />,
        href: '/admin/settings',
      },
    ];

    // Return appropriate items based on user role
    if (!user) return clientItems;
    
    switch (user.role) {
      case 'admin':
        return adminItems;
      case 'agent':
        return agentItems;
      default:
        return clientItems;
    }
  };

  const navItems = getNavItems();

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-md bg-primary p-2 text-white shadow-md md:hidden"
        onClick={toggleMobile}
        aria-label="Toggle mobile menu"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900",
          collapsed && "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">GSC</span>
            {!collapsed && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Global Service
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary-50 text-primary dark:bg-gray-800 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;