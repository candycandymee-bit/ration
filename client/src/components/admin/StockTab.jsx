import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Plus, AlertTriangle, Package, TrendingUp, BarChart3, RefreshCw, X } from 'lucide-react';

function StockTab({ onUpdate }) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({
    productName: 'RICE',
    quantity: '',
    unit: 'kg'
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const data = await apiService.get('/api/admin/stock');
      setStocks(data);
    } catch (error) {
      console.error('Failed to load stocks:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStocks();
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/api/admin/stock/supply', newStock);
      setShowAddModal(false);
      setNewStock({ productName: 'RICE', quantity: '', unit: 'kg' });
      loadStocks();
      onUpdate();
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity < 50) return { 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      label: 'Low',
      level: 'low'
    };
    if (quantity < 100) return { 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200',
      label: 'Medium',
      level: 'medium'
    };
    return { 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      border: 'border-green-200',
      label: 'Good',
      level: 'good'
    };
  };

  const getTotalStockValue = () => {
    return stocks.reduce((total, stock) => total + parseFloat(stock.quantityAvailable), 0);
  };

  const getLowStockItems = () => {
    return stocks.filter(stock => parseFloat(stock.quantityAvailable) < 50);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-gray-600">Loading stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stock Management</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4 text-primary-500" />
              <span>Total Items: {stocks.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              <span>Total Stock: {getTotalStockValue().toFixed(0)} units</span>
            </div>
            {getLowStockItems().length > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Low Stock: {getLowStockItems().length} items</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4 lg:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2 px-4 py-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2 px-4 py-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supply</span>
          </button>
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stocks.map((stock) => {
          const quantity = parseFloat(stock.quantityAvailable);
          const status = getStockStatus(quantity);
          const progressWidth = quantity > 100 ? 100 : quantity;
          
          return (
            <div key={stock.id} className={`bg-white rounded-xl shadow-xl border ${status.border} hover:shadow-md transition-shadow duration-200`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${status.bg}`}>
                      <Package className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {stock.productName.toLowerCase()}
                      </h3>
                      <p className="text-sm text-gray-500">{stock.unit}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                    {status.label}
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {quantity.toFixed(0)}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status.level === 'low' ? 'bg-red-500' : 
                        status.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                </div>
                
                {quantity < 50 && (
                  <div className="flex items-center justify-center text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Low stock alert
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {stocks.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stock items found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first stock supply.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Supply</span>
          </button>
        </div>
      )}

      {/* Enhanced Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur effect */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowAddModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add Stock Supply</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleAddStock} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Product Type
                </label>
                <select
                  value={newStock.productName}
                  onChange={(e) => setNewStock(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="RICE">Rice</option>
                  <option value="WHEAT">Wheat</option>
                  <option value="SUGAR">Sugar</option>
                  <option value="KEROSENE">Kerosene</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter quantity"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Unit of Measurement
                </label>
                <select
                  value={newStock.unit}
                  onChange={(e) => setNewStock(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="L">Liters (L)</option>
                  <option value="units">Units</option>
                </select>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors duration-200"
                >
                  Add Supply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockTab;