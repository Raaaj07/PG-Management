import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { Plus, Home, Trash2, AlertCircle, DoorClosed } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/PageHeader';
import { SkeletonCard } from '../../components/ui/Skeleton';

export const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNo: '', type: 'Double Sharing', floor: '1st Floor', ac: true, rent: 12000, capacity: 2 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/rooms');
      setRooms(response.data.data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setError('Failed to fetch rooms config.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.roomNo) return;
    setError(null);

    const added = {
      id: `room-${newRoom.roomNo}`,
      roomNo: newRoom.roomNo,
      type: newRoom.type,
      floor: newRoom.floor,
      ac: newRoom.ac,
      rent: parseFloat(newRoom.rent) || 10000,
      capacity: parseInt(newRoom.capacity) || 2,
      occupied: 0,
      hostelId: 'hostel-1'
    };

    setSubmitting(true);
    try {
      await client.post('/rooms', added);
      setRooms([...rooms, added]);
      setShowAddModal(false);
      setNewRoom({ roomNo: '', type: 'Double Sharing', floor: '1st Floor', ac: true, rent: 12000, capacity: 2 });
      toast.success('Room created successfully');
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('Failed to add new room to config.');
      toast.error('Failed to add new room to config.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirmDeleteId) return;
    setError(null);
    setDeleting(true);
    try {
      await client.delete(`/rooms/${confirmDeleteId}`);
      setRooms(rooms.filter(r => r.id !== confirmDeleteId));
      toast.success('Room removed');
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete room:', err);
      setError('Failed to delete room from config.');
      toast.error('Failed to delete room from config.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Configurations"
        subtitle="Add accommodation classes, adjust rents, and monitor capacities."
        actions={<Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Room</Button>}
      />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850">
          <EmptyState icon={DoorClosed} title="No rooms configured" description="Add your first room to start allocating tenants." action={<Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Room</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, idx) => {
            const isFull = room.occupied >= room.capacity;
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (idx % 6) * 0.04 }}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Room {room.roomNo}</h4>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{room.floor}</span>
                      </div>
                    </div>
                    <Badge tone={room.occupied === 0 ? 'success' : isFull ? 'danger' : 'warning'}>
                      {room.occupied === 0 ? 'Vacant' : isFull ? 'Full' : 'Partial'}
                    </Badge>
                  </div>

                  <div className="space-y-2 mt-4 text-xs font-semibold text-slate-655 dark:text-slate-350">
                    <div className="flex justify-between">
                      <span>Sharing Class:</span>
                      <span className="text-slate-900 dark:text-white">{room.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Air Conditioning:</span>
                      <span className="text-slate-900 dark:text-white">{room.ac ? 'AC Room' : 'Non-AC'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Occupants:</span>
                      <span className="text-slate-900 dark:text-white">{room.occupied} / {room.capacity} slots</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Monthly Rent</span>
                    <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">${room.rent}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteId(room.id)}
                    className="p-1.5 bg-red-50 dark:bg-red-955/20 text-red-655 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Create New Room"
        description="Enter room number and rent parameters to create an accommodation class."
        icon={Home}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="add-room-form" loading={submitting}>Confirm Room</Button>
          </>
        }
      >
        <form id="add-room-form" onSubmit={handleAddRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Room Number</label>
              <input
                type="text"
                required
                value={newRoom.roomNo}
                onChange={(e) => setNewRoom({ ...newRoom, roomNo: e.target.value })}
                placeholder="e.g. 301"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Floor Level</label>
              <select
                value={newRoom.floor}
                onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-950 dark:text-white"
              >
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Sharing Type</label>
              <select
                value={newRoom.type}
                onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-955 dark:text-white"
              >
                <option value="Single Room">Single Room</option>
                <option value="Double Sharing">Double Sharing</option>
                <option value="Triple Sharing">Triple Sharing</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1.5">Max Slots Capacity</label>
              <input
                type="number"
                required
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-955 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Monthly Rent ($)</label>
              <input
                type="number"
                required
                value={newRoom.rent}
                onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-955 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">AC Available</label>
              <select
                value={newRoom.ac}
                onChange={(e) => setNewRoom({ ...newRoom, ac: e.target.value === 'true' })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-955 dark:text-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title="Remove this room?"
        description="This room configuration will be permanently deleted."
        confirmLabel="Delete Room"
        loading={deleting}
        onConfirm={handleDeleteRoom}
      />
    </div>
  );
};
