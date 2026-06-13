import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Search, User, AlertCircle, Package, CheckCircle, ArrowLeft } from 'lucide-react';

function DistributeTab({ onUpdate }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [distribution, setDistribution] = useState({
    productName: 'RICE',
    quantity: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiService.get('/api/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rationCardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDistribute = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await apiService.post('/api/admin/distribute', {
        userId: selectedUser.id,
        productName: distribution.productName,
        quantity: parseInt(distribution.quantity)
      });

      setMessage({ type: 'success', text: 'Ration distributed successfully!' });
      setDistribution({ productName: 'RICE', quantity: '' });
      setSelectedUser(null);
      setSearchTerm('');
      onUpdate();
      
      // Reload users to get updated consumption data
      loadUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to distribute ration' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getQuotaInfo = (user, productName) => {
    if (!user) return { quota: 0, consumed: 0, remaining: 0 };
    
    const quotaField = `${productName.toLowerCase()}Quota`;
    const consumedField = `${productName.toLowerCase()}Consumed`;
    const quota = user[quotaField] || 0;
    const consumed = user[consumedField] || 0;
    const remaining = quota - consumed;
    return { quota, consumed, remaining };
  };

  const getProductUnit = (productName) => {
    return productName === 'KEROSENE' ? 'L' : 'kg';
  };

  const getProductColor = (productName) => {
    switch(productName) {
      case 'RICE': return 'from-amber-500 to-amber-600';
      case 'WHEAT': return 'from-yellow-500 to-yellow-600';
      case 'SUGAR': return 'from-gray-800 to-black-500';
      case 'KEROSENE': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Distribute Ration</h2>
        {showUserDetails && (
          <button 
            onClick={() => setShowUserDetails(false)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to search
          </button>
        )}
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        } flex items-center`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Selection */}
        {!showUserDetails ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Beneficiary</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or ration card number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDetails(true);
                    }}
                    className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-full">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">Card: {user.rationCardNumber}</p>
                      </div>
                      
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Beneficiary</h3>
            
            {selectedUser ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-gray-200">
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 rounded-full">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedUser.name}</h4>
                    <p className="text-sm text-gray-600">Card: {selectedUser.rationCardNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  
                  
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No user selected</p>
              </div>
            )}

            {selectedUser && (
              <>
                <h4 className="font-medium text-gray-800 mb-3">Current Allocation Status</h4>
                <div className="space-y-3">
                  {['RICE', 'WHEAT', 'SUGAR', 'KEROSENE'].map(product => {
                    const { consumed, quota, remaining } = getQuotaInfo(selectedUser, product);
                    const percentage = quota > 0 ? (consumed / quota) * 100 : 0;
                    
                    return (
                      <div key={product} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{product}</span>
                          <span className="text-sm text-gray-600">{consumed}/{quota} {getProductUnit(product)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage >= 80 ? 'bg-red-500' : 
                              percentage >= 50 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {remaining} {getProductUnit(product)} remaining
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Distribution Form */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution Details</h3>
          
          <form onSubmit={handleDistribute} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['RICE', 'WHEAT', 'SUGAR', 'KEROSENE'].map(product => (
                  <div
                    key={product}
                    onClick={() => setDistribution(prev => ({ ...prev, productName: product }))}
                    className={`p-3 rounded-xl cursor-pointer text-center transition-all ${
                      distribution.productName === product
                        ? `bg-gradient-to-r ${getProductColor(product)} text-white shadow-md`
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <Package className={`h-5 w-5 mx-auto mb-1 ${
                      distribution.productName === product ? 'text-white' : 'text-gray-600'
                    }`} />
                    <span className="text-sm font-medium">{product}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Distribute ({getProductUnit(distribution.productName)})
              </label>
              <input
                type="number"
                value={distribution.quantity}
                onChange={(e) => setDistribution(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={`Enter quantity in ${getProductUnit(distribution.productName)}`}
                min="1"
                required
                disabled={!selectedUser}
              />
              
              {selectedUser && (
                <div className="mt-2 text-sm text-gray-600 bg-white/50 p-2 rounded-lg">
                  Available quota: {getQuotaInfo(selectedUser, distribution.productName).remaining} {getProductUnit(distribution.productName)}
                </div>
              )}
            </div>

            {selectedUser && distribution.quantity && 
             parseInt(distribution.quantity) > getQuotaInfo(selectedUser, distribution.productName).remaining && (
              <div className="flex items-center p-3 bg-red-100 text-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">Quantity exceeds available quota</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedUser || isLoading || !distribution.quantity || 
                       (selectedUser && parseInt(distribution.quantity) > getQuotaInfo(selectedUser, distribution.productName).remaining)}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-md hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Distributing...
                </span>
              ) : (
                'Distribute Ration'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DistributeTab;