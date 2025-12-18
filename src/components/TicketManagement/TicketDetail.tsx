import { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Smartphone, 
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  FileText,
  Edit,
  Trash2,
  MessageSquare
} from 'lucide-react';
import type { View } from '@/types/view';

interface TicketDetailProps {
  ticketId: string;
  onNavigate: (view: View) => void;
}

export function TicketDetail({ ticketId, onNavigate }: TicketDetailProps) {
  const [currentStatus, setCurrentStatus] = useState('diagnosis');
  const [newNote, setNewNote] = useState('');

  const ticket = {
    id: 'TK-2024-1247',
    customer: { name: 'John Smith', email: 'john@email.com', phone: '+1 234 567 8900' },
    device: { type: 'laptop', brand: 'Apple', model: 'MacBook Pro 16"', serial: 'C02XL12345' },
    status: currentStatus,
    priority: 'high',
    sla: 'express',
    created: '2024-12-09 09:30',
    deadline: '2024-12-09 21:30',
    issue: 'Screen not turning on. Device was dropped. Customer reports no liquid damage.',
    condition: 'Minor dent on bottom right corner. Some scratches on lid.',
    accessories: ['Charger', 'Case'],
  };

  const statuses = [
    { id: 'new', label: 'New', color: 'text-[#00D9FF]', bg: 'bg-[#00D9FF]/10' },
    { id: 'diagnosis', label: 'Diagnosis', color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10' },
    { id: 'repair', label: 'Repair', color: 'text-[#FF6B35]', bg: 'bg-[#FF6B35]/10' },
    { id: 'testing', label: 'Testing', color: 'text-[#FFB800]', bg: 'bg-[#FFB800]/10' },
    { id: 'ready', label: 'Ready', color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/10' },
    { id: 'delivered', label: 'Delivered', color: 'text-[#64748B]', bg: 'bg-[#64748B]/10' },
  ];

  const activityLog = [
    { timestamp: '2024-12-09 14:30', user: 'Tech Mike', action: 'Changed status to Diagnosis', type: 'status' },
    { timestamp: '2024-12-09 11:15', user: 'Tech Mike', action: 'Reserved screen replacement part', type: 'part' },
    { timestamp: '2024-12-09 10:45', user: 'Tech Mike', action: 'Added note: Initial diagnosis complete. Screen needs replacement.', type: 'note' },
    { timestamp: '2024-12-09 09:45', user: 'Admin Sarah', action: 'Assigned ticket to Tech Mike', type: 'assignment' },
    { timestamp: '2024-12-09 09:30', user: 'Receptionist Anna', action: 'Created ticket', type: 'created' },
  ];

  const repairHistory = [
    { date: '2024-08-15', ticket: 'TK-2024-0892', issue: 'Battery replacement', status: 'completed' },
    { date: '2024-03-20', ticket: 'TK-2024-0234', issue: 'Keyboard cleaning', status: 'completed' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status': return <Clock className="w-4 h-4" />;
      case 'part': return <Package className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'assignment': return <User className="w-4 h-4" />;
      case 'created': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const currentStatusIndex = statuses.findIndex(s => s.id === currentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('tickets')}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">{ticket.id}</h1>
            <p className="text-[#94A3B8]">Ticket Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="px-4 py-2 bg-[#121B2D] border border-[#FF6B35] rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progress */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-6">Repair Status</h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {statuses.map((status, index) => (
                  <div key={status.id} className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => setCurrentStatus(status.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        index <= currentStatusIndex
                          ? `${status.bg} ${status.color} border-2 border-current`
                          : 'bg-[#121B2D] border-2 border-[#1A2642] text-[#64748B]'
                      }`}
                    >
                      {index < currentStatusIndex ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </button>
                    <span className={`mt-2 text-xs ${index <= currentStatusIndex ? status.color : 'text-[#64748B]'}`}>
                      {status.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#1A2642] -z-10">
                <div 
                  className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CC6A] transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00D9FF]" />
              Customer Information
            </h3>
            <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
              <p className="text-white mb-2">{ticket.customer.name}</p>
              <p className="text-[#94A3B8] text-sm mb-1">{ticket.customer.email}</p>
              <p className="text-[#94A3B8] text-sm">{ticket.customer.phone}</p>
            </div>
          </div>

          {/* Device Info */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#A78BFA]" />
              Device Information
            </h3>
            <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Brand & Model</p>
                  <p className="text-white">{ticket.device.brand} {ticket.device.model}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Type</p>
                  <p className="text-white capitalize">{ticket.device.type}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Serial Number</p>
                  <p className="text-white">{ticket.device.serial}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Accessories</p>
                  <p className="text-white">{ticket.accessories.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Issue Description</h3>
            <p className="text-[#94A3B8]">{ticket.issue}</p>
          </div>

          {/* Physical Condition */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Physical Condition</h3>
            <p className="text-[#94A3B8]">{ticket.condition}</p>
          </div>

          {/* Previous Repair History */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FFB800]" />
              Previous Repair History
            </h3>
            {repairHistory.length > 0 ? (
              <div className="space-y-3">
                {repairHistory.map((repair, index) => (
                  <div key={index} className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#00D9FF]">{repair.ticket}</span>
                      <span className="px-2 py-1 rounded text-xs bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
                        {repair.status}
                      </span>
                    </div>
                    <p className="text-[#94A3B8] text-sm mb-1">{repair.issue}</p>
                    <p className="text-[#64748B] text-xs">{repair.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#64748B]">No previous repairs</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Ticket Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Created</p>
                <p className="text-white text-sm">{ticket.created}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">SLA Deadline</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFB800]" />
                  <p className="text-[#FFB800] text-sm">{ticket.deadline}</p>
                </div>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Priority</p>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B35]"></div>
                  High
                </span>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">SLA Type</p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#64748B]/10 text-[#94A3B8] text-sm border border-[#64748B]/20">
                  {ticket.sla}
                </span>
              </div>
            </div>
          </div>

          {/* Add Note */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#00FF88]" />
              Add Note
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note to the activity log..."
              rows={4}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none mb-3"
            />
            <button className="w-full py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform">
              Add Note
            </button>
          </div>

          {/* Activity Log */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Activity Log</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLog.map((activity, index) => (
                <div key={index} className="border-l-2 border-[#1A2642] pl-4 pb-3">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="text-[#00FF88] mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#94A3B8] text-sm">{activity.action}</p>
                      <p className="text-[#64748B] text-xs mt-1">
                        {activity.user} • {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
