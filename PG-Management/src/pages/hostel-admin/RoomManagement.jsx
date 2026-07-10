import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Plus, Home, Trash2, AlertCircle } from 'lucide-react';

export const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNo: '', type: 'Double Sharing', floor: '1st Floor', ac: true, rent: 12000, capacity: 2 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    setLoading(true);
    try {
      await client.post('/rooms', added);
      setRooms([...rooms, added]);
      setShowAddModal(false);
      setNewRoom({ roomNo: '', type: 'Double Sharing', floor: '1st Floor', ac: true, rent: 12000, capacity: 2 });
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('Failed to add new room to config.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to remove this room?')) {
      setError(null);
      try {
        await client.delete(`/rooms/${roomId}`);
        const updated = rooms.filter(r => r.id !== roomId);
        setRooms(updated);
      } catch (err) {
        console.error('Failed to delete room:', err);
        setError('Failed to delete room from config.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Room Configurations</h1>
          <p className="text-xs text-slate-500 font-medium">Add accommodation classes, adjust rents, and monitor capacities.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const isFull = room.occupied >= room.capacity;
          return (
            <div key={room.id} className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col justify-between transition-all">
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
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    room.occupied === 0 ? 'bg-emerald-500/10 text-emerald-500' :
                    isFull ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-550'
                  }`}>
                    {room.occupied === 0 ? 'Vacant' : isFull ? 'Full' : 'Partial'}
                  </span>
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
                  onClick={() => handleDeleteRoom(room.id)}
                  className="p-1.5 bg-red-50 dark:bg-red-955/20 text-red-655 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-855 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Create New Room</h3>
            <p className="text-xs text-slate-500 mb-6 font-semibold">Enter room number and rent parameters to create an accommodation class.</p>

            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Room Number</label>
                  <input
                    type="text"
                    required
                    value={newRoom.roomNo}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNo: e.target.value })}
                    placeholder="e.g. 301"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Floor Level</label>
                  <select
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-950 dark:text-white"
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
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
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
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
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
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">AC Available</label>
                  <select
                    value={newRoom.ac}
                    onChange={(e) => setNewRoom({ ...newRoom, ac: e.target.value === 'true' })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-655"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Confirm Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
