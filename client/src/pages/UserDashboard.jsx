import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import QuotaChart from '../components/user/QuotaChart';
import StockTable from '../components/user/StockTable';
import TransactionsTable from '../components/user/TransactionsTable';
import { Package, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.get('/api/user/dashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-slate-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-800">Failed to load dashboard data</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { user, shopStock, recentTransactions } = dashboardData;
  const quotas = user.quotas;

  const totalQuota = Object.values(quotas).reduce((sum, item) => sum + item.quota, 0);
  const totalConsumed = Object.values(quotas).reduce((sum, item) => sum + item.consumed, 0);
  const utilizationRate = totalQuota > 0 ? ((totalConsumed / totalQuota) * 100).toFixed(1) : 0;

  const StatCard = ({ title, value, icon: Icon, color, suffix }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}{suffix}</p>
        </div>
        <div className={`p-3 rounded-full bg-orange-100`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
            <p className="text-slate-700">Ration Card: {user.rationCardNumber}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4 sm:mt-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Quota" 
            value={totalQuota} 
            icon={Package} 
            color="text-slate-600"
          />
          <StatCard 
            title="Consumed" 
            value={totalConsumed} 
            icon={TrendingUp} 
            color="text-slate-800"
          />
          <StatCard 
            title="Utilization Rate" 
            value={utilizationRate} 
            icon={AlertCircle} 
            color="text-slate-700"
            suffix="%"
          />
          <StatCard 
            title="Transactions" 
            value={recentTransactions.length} 
            icon={Clock} 
            color="text-slate-600"
          />
        </div>

        {/* Quota Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Monthly Quota Usage</h2>
          </div>
          <QuotaChart quotas={quotas} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shop Stock */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Shop Stock Availability</h2>
            <StockTable stocks={shopStock} />
          </div>

          {/* Recent Transactions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Transactions</h2>
            <TransactionsTable transactions={recentTransactions} />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-slate-700 text-sm mt-8">
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
