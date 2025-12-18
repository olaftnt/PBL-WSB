'use client';

import { useState } from 'react';
import { Plus, Search, AlertTriangle, Package, Edit, Minus } from 'lucide-react';

const mockParts = [
  { id: '1', sku: 'SCR-IP14-001', name: 'iPhone 14 Pro Screen', quantity: 8, minQuantity: 5, price: 199.99, category: 'Screens', status: 'ok' },
  { id: '2', sku: 'BAT-MBP-16', name: 'MacBook Pro 16" Battery', quantity: 3, minQuantity: 5, price: 149.99, category: 'Batteries', status: 'low' },
  { id: '3', sku: 'SCR-GAL-S23', name: 'Samsung Galaxy S23 Screen', quantity: 12, minQuantity: 8, price: 179.99, category: 'Screens', status: 'ok' },
  { id: '4', sku: 'BAT-IP13-001', name: 'iPhone 13 Battery', quantity: 2, minQuantity: 6, price: 79.99, category: 'Batteries', status: 'critical' },
  { id: '5', sku: 'KEY-MBP-M1', name: 'MacBook Pro M1 Keyboard', quantity: 5, minQuantity: 3, price: 249.99, category: 'Keyboards', status: 'ok' },
  { id: '6', sku: 'CAM-IP14-FRT', name: 'iPhone 14 Front Camera', quantity: 15, minQuantity: 10, price: 89.99, category: 'Cameras', status: 'ok' },
  { id: '7', sku: 'CHG-USBC-65W', name: 'USB-C Charger 65W', quantity: 1, minQuantity: 10, price: 39.99, category: 'Accessories', status: 'critical' },
  { id: '8', sku: 'SCR-IP12-001', name: 'iPhone 12 Screen', quantity: 6, minQuantity: 5, price: 159.99, category: 'Screens', status: 'ok' },
];

export function InventoryList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  const categories = ['all', 'Screens', 'Batteries', 'Keyboards', 'Cameras', 'Accessories'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return { bg: 'bg-[#00FF88]/10', text: 'text-[#00FF88]', border: 'border-[#00FF88]/20', label: 'In Stock' };
      case 'low':
        return { bg: 'bg-[#FFB800]/10', text: 'text-[#FFB800]', border: 'border-[#FFB800]/20', label: 'Low Stock' };
      case 'critical':
        return { bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', border: 'border-[#FF6B35]/20', label: 'Critical' };
      default:
        return { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]', border: 'border-[#64748B]/20', label: 'Unknown' };
    }
  };

  const filteredParts = mockParts.filter(part =>
    (categoryFilter === 'all' || part.category === categoryFilter) &&
    (searchQuery === '' ||
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const lowStockCount = mockParts.filter(p => p.status === 'low' || p.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Inventory & Parts Management</h1>
          <p className="text-[#94A3B8]">Manage repair parts and stock levels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Part
        </button>
      </div>

      {/* Alert */}
      {lowStockCount > 0 && (
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FF6B35] mt-0.5" />
          <div>
            <p className="text-[#FF6B35] mb-1">Low Stock Alert</p>
            <p className="text-[#94A3B8] text-sm">{lowStockCount} parts are running low or out of stock</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
        <div className="text-[#94A3B8] text-sm">
          {filteredParts.length} parts found
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-[#0C1222] rounded-xl border border-[#1A2642] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A2642]">
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">SKU</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Part Name</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Category</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Quantity</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Min Stock</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Price</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Status</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => {
                const statusBadge = getStatusBadge(part.status);
                return (
                  <tr key={part.id} className="border-b border-[#1A2642] hover:bg-[#121B2D] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">{part.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8]">{part.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8] text-sm">{part.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className={`w-4 h-4 ${part.status === 'ok' ? 'text-[#00FF88]' : 'text-[#FF6B35]'}`} />
                        <span className="text-white">{part.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm">{part.minQuantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#00FF88]">${part.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPart(part);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-[#94A3B8] hover:text-[#00FF88] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#94A3B8] hover:text-[#00D9FF] transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Add New Part</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">SKU</label>
                  <input
                    type="text"
                    placeholder="SCR-IP14-001"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Category</label>
                  <select className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors">
                    <option>Screens</option>
                    <option>Batteries</option>
                    <option>Keyboards</option>
                    <option>Cameras</option>
                    <option>Accessories</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Part Name</label>
                <input
                  type="text"
                  placeholder="iPhone 14 Pro Screen"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Min Quantity</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="199.99"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform"
                >
                  Add Part
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (similar structure) */}
      {showEditModal && selectedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Edit Part - {selectedPart.name}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPart(null);
                }}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Current Quantity</label>
                <input
                  type="number"
                  defaultValue={selectedPart.quantity}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPart(null);
                  }}
                  className="flex-1 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
