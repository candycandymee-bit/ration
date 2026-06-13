import React from 'react';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

function StockTable({ stocks }) {
  const getStockStatus = (quantity) => {
    if (quantity < 50) return { 
      color: 'text-red-700', 
      bg: 'bg-red-100', 
      border: 'border-red-200',
      label: 'Low Stock', 
      icon: AlertTriangle 
    };
    if (quantity < 100) return { 
      color: 'text-amber-700', 
      bg: 'bg-amber-100', 
      border: 'border-amber-200',
      label: 'Medium Stock', 
      icon: Package 
    };
    return { 
      color: 'text-green-700', 
      bg: 'bg-green-100', 
      border: 'border-green-200',
      label: 'In Stock', 
      icon: CheckCircle 
    };
  };

  if (stocks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-900 bg-amber-50 rounded-lg border border-amber-200">
        <Package className="h-8 w-8 mx-auto text-amber-400 mb-2" />
        <p>No stock information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stocks.map((stock) => {
        const status = getStockStatus(parseFloat(stock.quantityAvailable));
        const StatusIcon = status.icon;
        
        return (
          <div 
            key={stock.id} 
            className={`flex items-center justify-between p-4 rounded-xl border ${status.border} bg-white/50 backdrop-blur-sm transition-all hover:shadow-sm`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${status.bg}`}>
                <Package className={`h-5 w-5 ${status.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {stock.productName.charAt(0).toUpperCase() + stock.productName.slice(1).toLowerCase()}
                </h4>
                <p className="text-sm text-gray-800">
                  {parseFloat(stock.quantityAvailable).toFixed(0)} {stock.unit} available
                </p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color} border ${status.border}`}>
              <StatusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{status.label}</span>
            </div>
          </div>
        );
      })}
      
      {/* Stock Status Legend */}
      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-xs font-medium text-gray-800 mb-2">Stock Status Info:</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full"></div>
            <span className="text-xs text-gray-700">In Stock (100+ units)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-full"></div>
            <span className="text-xs text-gray-700">Medium (50-99 units)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div>
            <span className="text-xs text-black-400">Low (Below 50 units)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockTable;