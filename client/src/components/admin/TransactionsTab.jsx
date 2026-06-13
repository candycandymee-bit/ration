import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Calendar, Download, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';

function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'transactionDate', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [dateFilter]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, productFilter, sortConfig]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const params = dateFilter ? `?date=${dateFilter}` : '';
      const data = await apiService.get(`/api/admin/transactions${params}`);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user.rationCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.productName.toLowerCase() === productFilter.toLowerCase()
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductColor = (productName) => {
    switch(productName.toLowerCase()) {
      case 'rice': return 'bg-amber-100 text-amber-800';
      case 'wheat': return 'bg-yellow-100 text-yellow-800';
      case 'sugar': return 'bg-gray-100 text-gray-800';
      case 'kerosene': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Ration Card', 'Product', 'Quantity', 'Admin'];
    const csvData = filteredTransactions.map(transaction => [
      formatDate(transaction.transactionDate),
      transaction.user.name,
      transaction.user.rationCardNumber,
      transaction.productName,
      `${parseFloat(transaction.quantity)} ${transaction.unit}`,
      transaction.admin.fullName
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUniqueProducts = () => {
    const products = [...new Set(transactions.map(t => t.productName))];
    return products.sort();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">Transaction History</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Filter</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Products</option>
                {getUniqueProducts().map(productN => (
                  <option key={productN} value={productN}>
                    {product.charAt(0) + productN.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-medium opacity-220">Total Transactions</div>
          <div className="text-2xl font-bold">{filteredTransactions.length}</div>
        </div>
        <div className="bg-gradient-to-r from-amber-700 to-amber-500 text-white rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-medium opacity-80">Today</div>
          <div className="text-2xl font-bold">
            {filteredTransactions.filter(t => {
              const today = new Date().toDateString();
              return new Date(t.transactionDate).toDateString() === today;
            }).length}
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-800 to-black-800 text-white rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-medium opacity-80">This Week</div>
          <div className="text-2xl font-bold">
            {filteredTransactions.filter(t => {
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return new Date(t.transactionDate) >= oneWeekAgo;
            }).length}
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-100 to-gray-800 text-black rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-medium opacity-80">This Month</div>
          <div className="text-2xl font-bold">
            {filteredTransactions.filter(t => {
              const thisMonth = new Date().getMonth();
              const thisYear = new Date().getFullYear();
              return new Date(t.transactionDate).getMonth() === thisMonth && 
                     new Date(t.transactionDate).getFullYear() === thisYear;
            }).length}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {[
                  { key: 'transactionDate', label: 'Date & Time' },
                  { key: 'user', label: 'User' },
                  { key: 'productName', label: 'Product' },
                  { key: 'quantity', label: 'Quantity' },
                  { key: 'admin', label: 'Admin' }
                ].map((header) => (
                  <th 
                    key={header.key}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:text-primary-600"
                    onClick={() => handleSort(header.key)}
                  >
                    <div className="flex items-center">
                      {header.label}
                      {sortConfig.key === header.key && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.user.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {transaction.user.rationCardNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProductColor(transaction.productName)}`}>
                      {transaction.productName.charAt(0) + transaction.productName.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                    {parseFloat(transaction.quantity)} {transaction.unit}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                    {transaction.admin.fullName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <Search className="h-12 w-12 text-gray-300 mx-auto" />
              </div>
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsTab;