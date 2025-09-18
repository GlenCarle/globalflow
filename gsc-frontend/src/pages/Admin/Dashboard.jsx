import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCog, 
  Briefcase, 
  FileText, 
  Settings,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../constants/routes';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'

  // Mock data for dashboard
  const stats = {
    revenue: {
      total: 125000,
      previous: 110000,
      change: 13.64
    },
    clients: {
      total: 248,
      previous: 220,
      change: 12.73
    },
    applications: {
      total: 156,
      previous: 140,
      change: 11.43
    },
    appointments: {
      total: 78,
      previous: 65,
      change: 20.00
    }
  };

  const recentUsers = [
    { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'client', status: 'active', date: '2025-09-15' },
    { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com', role: 'client', status: 'active', date: '2025-09-14' },
    { id: 3, name: 'Ahmed Bello', email: 'ahmed.bello@example.com', role: 'agent', status: 'active', date: '2025-09-13' },
    { id: 4, name: 'Sophie Lefebvre', email: 'sophie.lefebvre@example.com', role: 'client', status: 'pending', date: '2025-09-12' },
  ];

  const popularServices = [
    { id: 1, name: 'Visa Étudiant Canada', count: 45, revenue: 22500 },
    { id: 2, name: 'Visa Travail États-Unis', count: 32, revenue: 19200 },
    { id: 3, name: 'Résidence Permanente Canada', count: 28, revenue: 42000 },
    { id: 4, name: 'Visa Tourisme France', count: 25, revenue: 7500 },
    { id: 5, name: 'Visa Étudiant France', count: 18, revenue: 9000 },
  ];

  const revenueByMonth = [
    { month: 'Jan', amount: 85000 },
    { month: 'Fév', amount: 92000 },
    { month: 'Mar', amount: 98000 },
    { month: 'Avr', amount: 90000 },
    { month: 'Mai', amount: 95000 },
    { month: 'Juin', amount: 105000 },
    { month: 'Juil', amount: 115000 },
    { month: 'Août', amount: 120000 },
    { month: 'Sep', amount: 125000 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 0 },
    { month: 'Déc', amount: 0 },
  ];

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to get status badge variant
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Helper function to get role badge variant
  const getRoleVariant = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'agent':
        return 'warning';
      case 'client':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Helper function to get change indicator
  const getChangeIndicator = (change) => {
    if (change > 0) {
      return (
        <span className="flex items-center text-emerald-500">
          <ArrowUp className="mr-1 h-4 w-4" />
          {change.toFixed(2)}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-rose-500">
          <ArrowDown className="mr-1 h-4 w-4" />
          {Math.abs(change).toFixed(2)}%
        </span>
      );
    } else {
      return (
        <span className="text-gray-500">0%</span>
      );
    }
  };

  return (
    <div className="space-y-6 p-1 md:p-0">
      {/* Welcome Section */}
      <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Tableau de bord administrateur
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue, {user?.first_name || 'Admin'} | Aperçu des performances et statistiques
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10 pr-4 w-full md:w-64"
              />
            </div>
            <div className="flex gap-1 rounded-md border border-gray-200 p-1 dark:border-gray-700">
              <Button 
                variant={dateRange === 'week' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setDateRange('week')}
              >
                Semaine
              </Button>
              <Button 
                variant={dateRange === 'month' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setDateRange('month')}
              >
                Mois
              </Button>
              <Button 
                variant={dateRange === 'year' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setDateRange('year')}
              >
                Année
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Chiffre d'affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</span>
              </div>
              {getChangeIndicator(stats.revenue.change)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              vs {formatCurrency(stats.revenue.previous)} le mois précédent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.clients.total}</span>
              </div>
              {getChangeIndicator(stats.clients.change)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              vs {stats.clients.previous} le mois précédent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Demandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.applications.total}</span>
              </div>
              {getChangeIndicator(stats.applications.change)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              vs {stats.applications.previous} le mois précédent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.appointments.total}</span>
              </div>
              {getChangeIndicator(stats.appointments.change)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              vs {stats.appointments.previous} le mois précédent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Chiffre d'affaires</CardTitle>
              <CardDescription>Évolution du chiffre d'affaires par mois</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <div className="flex h-full items-end gap-2">
                {revenueByMonth.map((item, index) => (
                  <div key={index} className="relative flex h-full flex-1 flex-col justify-end">
                    <div 
                      className="bg-primary rounded-t w-full transition-all hover:opacity-80"
                      style={{ 
                        height: `${(item.amount / Math.max(...revenueByMonth.map(i => i.amount))) * 100}%`,
                        minHeight: item.amount > 0 ? '10px' : '0'
                      }}
                    />
                    <span className="mt-2 text-center text-xs font-medium">{item.month}</span>
                    {item.amount > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                        {formatCurrency(item.amount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Services populaires</CardTitle>
              <CardDescription>Les services les plus demandés</CardDescription>
            </div>
            <Link to={ROUTES.ADMIN_ROUTES.SERVICES}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{service.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{service.count} demandes</span>
                      <span>•</span>
                      <span>{formatCurrency(service.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div 
                      className="h-full bg-primary"
                      style={{ 
                        width: `${(service.count / Math.max(...popularServices.map(s => s.count))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Utilisateurs récents</CardTitle>
            <CardDescription>Les derniers utilisateurs inscrits sur la plateforme</CardDescription>
          </div>
          <Link to={ROUTES.ADMIN_ROUTES.USERS}>
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rôle</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date d'inscription</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getRoleVariant(user.role)}>
                        {user.role === 'client' ? 'Client' : user.role === 'agent' ? 'Agent' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status === 'active' ? 'Actif' : user.status === 'pending' ? 'En attente' : user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`${ROUTES.ADMIN_ROUTES.USERS}/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          Détails
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Users className="mb-4 h-10 w-10 text-primary" />
          <h3 className="mb-2 font-semibold">Gestion des utilisateurs</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Gérer les comptes clients et agents
          </p>
          <Link to={ROUTES.ADMIN_ROUTES.USERS}>
            <Button variant="outline" className="w-full">Accéder</Button>
          </Link>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <UserCog className="mb-4 h-10 w-10 text-primary" />
          <h3 className="mb-2 font-semibold">Gestion des agents</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Gérer les comptes et permissions des agents
          </p>
          <Link to={ROUTES.ADMIN_ROUTES.AGENTS}>
            <Button variant="outline" className="w-full">Accéder</Button>
          </Link>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Briefcase className="mb-4 h-10 w-10 text-primary" />
          <h3 className="mb-2 font-semibold">Catalogue de services</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Gérer les services et destinations
          </p>
          <Link to={ROUTES.ADMIN_ROUTES.SERVICES}>
            <Button variant="outline" className="w-full">Accéder</Button>
          </Link>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="mb-4 h-10 w-10 text-primary" />
          <h3 className="mb-2 font-semibold">Rapports</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Générer et exporter des rapports
          </p>
          <Link to={ROUTES.ADMIN_ROUTES.REPORTS}>
            <Button variant="outline" className="w-full">Accéder</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
