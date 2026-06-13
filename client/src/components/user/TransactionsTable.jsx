import React from 'react';
import { Clock, Calendar, User, Scale } from 'lucide-react';

function TransactionsTable({ transactions }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-800 bg-amber-50 rounded-xl border border-amber-200">
        <Clock className="h-8 w-8 mx-auto text-amber-400 mb-2" />
        <p className="text-gray-900">No transactions found</p>
        <p className="text-sm text-gray-700 mt-1">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-start justify-between p-4 border border-amber-200 rounded-xl bg-white/50 backdrop-blur-sm transition-all hover:shadow-sm"
        >
          <div className="flex items-start space-x-4 flex-1">
            <div className="p-2 bg-amber-100 rounded-lg mt-0.5">
              <Scale className="h-4 w-4 text-amber-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {transaction.productName.charAt(0).toUpperCase() + transaction.productName.slice(1).toLowerCase()}
                </h4>
                <span className="text-gray-800 font-medium">
                  {parseFloat(transaction.quantity)} {transaction.unit}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>by {transaction.admin.fullName}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right ml-4">
            <div className="flex items-center space-x-1 text-gray-600 justify-end mb-1">
              <Calendar className="h-3 w-3" />
              <span className="text-xs font-medium">{getDayOfWeek(transaction.transactionDate)}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(transaction.transactionDate)}
            </p>
          </div>
        </div>
      ))}
      
      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-amber-200">
        <div className="flex justify-between items-center text-sm text-gray-700">
          <span>Total transactions: {transactions.length}</span>
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Updated just now</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default TransactionsTable;