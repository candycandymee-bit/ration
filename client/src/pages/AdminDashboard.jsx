import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import StockTab from '../components/admin/StockTab';
import DistributeTab from '../components/admin/DistributeTab';
import TransactionsTab from '../components/admin/TransactionsTab';
import UsersTab from '../components/admin/UsersTab';
import { Package, Users, TrendingUp, Clock, Bell, Settings, LogOut, User, BarChart3, Search } from 'lucide-react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stock');
  const [dashboardData, setDashboardData] = useState({
    totalStock: 0,
    todayTransactions: 0,
    totalUsers: 0,
    lowStockAlerts: 0,
    weeklyTrend: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [stockData, usersData, transactionsData] = await Promise.all([
        apiService.get('/api/admin/stock'),
        apiService.get('/api/admin/users'),
        apiService.get('/api/admin/transactions?limit=100')
      ]);

      const totalStock = stockData.reduce((sum, item) => sum + parseFloat(item.quantityAvailable), 0);
      const lowStockAlerts = stockData.filter(item => parseFloat(item.quantityAvailable) < 50).length;
      
      const today = new Date().toISOString().split('T')[0];
      const todayTransactions = transactionsData.filter(
        t => t.transactionDate.startsWith(today)
      ).length;

      // Generate weekly trend data (mock for now)
      const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          transactions: Math.floor(Math.random() * 20) + 5
        };
      }).reverse();

      setDashboardData({
        totalStock: totalStock.toFixed(0),
        todayTransactions,
        totalUsers: usersData.length,
        lowStockAlerts,
        weeklyTrend
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      // This would be an API call in a real application
      const mockNotifications = [
        { id: 1, message: 'Low stock alert for Rice', type: 'warning', time: '10 mins ago' },
        { id: 2, message: 'New user registered', type: 'info', time: '1 hour ago' },
        { id: 3, message: 'Weekly report is ready', type: 'success', time: '2 hours ago' }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const tabs = [
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'distribute', label: 'Distribute Ration', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Clock },
    { id: 'users', label: 'Users', icon: Users }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          
          
            
          
          
          {/* User Menu */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </button>
            
            
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Total Stock */}
  <div className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white rounded-2xl p-5 shadow-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-80">Total Stock</p>
        <p className="text-3xl font-bold">{dashboardData.totalStock}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-full">
        <Package className="h-6 w-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center">
      <span className="text-sm opacity-80">Items in inventory</span>
    </div>
  </div>

  {/* Today's Transactions */}
  <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-5 shadow-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-80">Today's Transactions</p>
        <p className="text-3xl font-bold">{dashboardData.todayTransactions}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-full">
        <TrendingUp className="h-6 w-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center">
      <span className="text-sm opacity-80">Completed today</span>
    </div>
  </div>

  {/* Registered Users */}
  <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-800 text-white rounded-2xl p-5 shadow-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-80">Registered Users</p>
        <p className="text-3xl font-bold">{dashboardData.totalUsers}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-full">
        <Users className="h-6 w-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center">
      <span className="text-sm opacity-80">Total beneficiaries</span>
    </div>
  </div>

  {/* Low Stock Alerts */}
  <div className="bg-gradient-to-r from-red-900 via-red-800 to-gray-900 text-white rounded-2xl p-5 shadow-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-80">Low Stock Alerts</p>
        <p className="text-3xl font-bold">{dashboardData.lowStockAlerts}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-full">
        <Clock className="h-6 w-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center">
      <span className="text-sm opacity-80">Needs attention</span>
    </div>
  </div>
</div>


        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-2">
          <nav className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  } flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-6 relative z-0">
          {activeTab === 'stock' && <StockTab onUpdate={loadDashboardData} />}
          {activeTab === 'distribute' && <DistributeTab onUpdate={loadDashboardData} />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'users' && <UsersTab onUpdate={loadDashboardData} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
