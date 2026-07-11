import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { 
  Key, UserMinus, LayoutGrid, List, Bed, Home, Plus, 
  Trash2, UserPlus, Sparkles, AlertTriangle, AlertCircle 
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/Button';

const ROOM_IMAGES = {
  '101': 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=60',
  '102': 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=60',
  '103': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=60',
  '104': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=60',
  '201': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=60',
  '202': 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&auto=format&fit=crop&q=60'
};

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=60';

export const RoomAllocation = () => {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [viewMode, setViewMode] = useState('rooms'); // 'rooms' (Airbnb Grid) or 'residents' (Table list)
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [targetRoomNo, setTargetRoomNo] = useState('101');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeallocate, setConfirmDeallocate] = useState(null); // { studentId, roomNo }
  const [deallocating, setDeallocating] = useState(false);
  const [submittingAllocation, setSubmittingAllocation] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, roomsRes] = await Promise.all([
        client.get('/users'),
        client.get('/rooms')
      ]);
      const allUsers = usersRes.data.data;
      const studentUsers = allUsers.filter(u => u.role === 'student');
      setStudents(studentUsers);
      setRooms(roomsRes.data.data);
    } catch (err) {
      console.error('Failed to load room allocation details:', err);
      setError('Failed to fetch rooms and residents databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deallocateRoom = async () => {
    if (!confirmDeallocate) return;
    const { studentId, roomNo } = confirmDeallocate;
    setError(null);
    setDeallocating(true);
    try {
      const [usersRes, roomsRes] = await Promise.all([
        client.get('/users'),
        client.get('/rooms')
      ]);
      const targetStudent = usersRes.data.data.find(u => u.id === studentId);
      const targetRoom = roomsRes.data.data.find(r => r.roomNo === roomNo);
      if (!targetStudent || !targetRoom) return;

      const updatedStudent = { ...targetStudent, roomId: null, roomNo: 'Unallocated' };
      const updatedRoom = { ...targetRoom, occupied: Math.max(0, targetRoom.occupied - 1) };

      await Promise.all([
        client.put(`/users/${studentId}`, updatedStudent),
        client.put(`/rooms/${targetRoom.id}`, updatedRoom)
      ]);

      await fetchData();
      toast.success('Room deallocated');
      setConfirmDeallocate(null);
    } catch (err) {
      console.error('Failed to deallocate room:', err);
      setError('Failed to deallocate room.');
      toast.error('Failed to deallocate room.');
    } finally {
      setDeallocating(false);
    }
  };

  const handleAllocateFromStudent = (student) => {
    setSelectedStudent(student);
    setSelectedRoom(null);
    const vacantRooms = rooms.filter(r => r.occupied < r.capacity);
    if (vacantRooms.length > 0) {
      setTargetRoomNo(vacantRooms[0].roomNo);
    }
    setShowAllocateModal(true);
  };

  const handleAllocateFromRoom = (room) => {
    setSelectedRoom(room);
    setSelectedStudent(null);
    const unallocated = students.filter(s => !s.roomId || s.roomNo === 'Unallocated');
    if (unallocated.length > 0) {
      setTargetStudentId(unallocated[0].id);
    } else {
      setTargetStudentId('');
    }
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmittingAllocation(true);
    try {
      const [usersRes, roomsRes] = await Promise.all([
        client.get('/users'),
        client.get('/rooms')
      ]);

      if (selectedStudent) {
        if (!targetRoomNo) return;
        const targetStudent = usersRes.data.data.find(u => u.id === selectedStudent.id);
        const targetRoom = roomsRes.data.data.find(r => r.roomNo === targetRoomNo);
        if (!targetStudent || !targetRoom) return;

        const updatedStudent = { ...targetStudent, roomId: targetRoom.id, roomNo: targetRoomNo };
        const updatedRoom = { ...targetRoom, occupied: Math.min(targetRoom.capacity, targetRoom.occupied + 1) };

        await Promise.all([
          client.put(`/users/${selectedStudent.id}`, updatedStudent),
          client.put(`/rooms/${targetRoom.id}`, updatedRoom)
        ]);
      } 
      else if (selectedRoom) {
        if (!targetStudentId) return;
        const targetStudent = usersRes.data.data.find(u => u.id === targetStudentId);
        const targetRoom = roomsRes.data.data.find(r => r.id === selectedRoom.id);
        if (!targetStudent || !targetRoom) return;

        const updatedStudent = { ...targetStudent, roomId: selectedRoom.id, roomNo: selectedRoom.roomNo };
        const updatedRoom = { ...targetRoom, occupied: Math.min(targetRoom.capacity, targetRoom.occupied + 1) };

        await Promise.all([
          client.put(`/users/${targetStudentId}`, updatedStudent),
          client.put(`/rooms/${selectedRoom.id}`, updatedRoom)
        ]);
      }

      setShowAllocateModal(false);
      setSelectedStudent(null);
      setSelectedRoom(null);
      fetchData();
      toast.success('Room allocated successfully');
    } catch (err) {
      console.error('Failed to allocate room:', err);
      setError('Failed to save room allocation.');
      toast.error('Failed to save room allocation.');
    } finally {
      setSubmittingAllocation(false);
    }
  };

  const getRoomImage = (roomNo) => ROOM_IMAGES[roomNo] || DEFAULT_ROOM_IMAGE;

  const unallocatedStudents = students.filter(s => !s.roomId || s.roomNo === 'Unallocated');
  const vacantRooms = rooms.filter(r => r.occupied < r.capacity);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Room Allocations</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Airbnb-style interactive room allocations and student assignments.</p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex bg-slate-100 dark:bg-slate-955 p-1 rounded-xl border border-slate-200 dark:border-slate-850 self-start">
          <button
            onClick={() => setViewMode('rooms')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'rooms'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-450 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Rooms View
          </button>
          <button
            onClick={() => setViewMode('residents')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'residents'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-450 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Residents List
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Airbnb-style Rooms Grid View */}
      {viewMode === 'rooms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isFull = room.occupied >= room.capacity;
            const roomStudents = students.filter(s => s.roomId === room.id || s.roomNo === room.roomNo);
            const image = getRoomImage(room.roomNo);

            return (
              <div 
                key={room.id} 
                className="bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Airbnb Image Section */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={image} 
                    alt={`Room ${room.roomNo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                  />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                      room.ac 
                        ? 'bg-sky-500/90 text-white shadow-sm' 
                        : 'bg-slate-650/90 text-white shadow-sm'
                    }`}>
                      {room.ac ? 'AC' : 'Non-AC'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                      isFull 
                        ? 'bg-red-500 text-white' 
                        : room.occupied === 0 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-amber-500 text-white'
                    }`}>
                      {isFull ? 'Full' : room.occupied === 0 ? 'Vacant' : 'Partial'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-bold text-xs">
                    Room {room.roomNo}
                  </div>
                </div>

                {/* Airbnb Details Section */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{room.floor}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{room.type}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Monthly Rent</span>
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">₹{room.rent}</p>
                      </div>
                    </div>

                    {/* Bed Layout Indicator */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Bed Slot Capacity</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{room.occupied} / {room.capacity} Occupied</span>
                      </div>
                      <div className="flex gap-2">
                        {Array.from({ length: room.capacity }).map((_, idx) => {
                          const isOccupied = idx < room.occupied;
                          return (
                            <div 
                              key={idx} 
                              className={`flex-grow p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-colors ${
                                isOccupied 
                                  ? 'bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white' 
                                  : 'bg-transparent border-dashed border-slate-200 dark:border-slate-800 text-slate-350 dark:text-slate-600'
                              }`}
                            >
                              <Bed className="w-5 h-5 shrink-0" />
                              <span className="text-[8px] font-bold uppercase tracking-wider select-none">
                                {isOccupied ? 'Occupied' : 'Vacant'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Occupants directory */}
                    <div className="mt-4 space-y-2">
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Allocated Residents</span>
                      {roomStudents.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No students allocated to this room yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {roomStudents.map(student => (
                            <div key={student.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850">
                              <div className="flex items-center gap-2">
                                <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="font-bold text-xs text-slate-900 dark:text-white">{student.name}</span>
                              </div>
                              <button
                                onClick={() => setConfirmDeallocate({ studentId: student.id, roomNo: room.roomNo })}
                                className="p-1 hover:bg-red-55/20 text-red-500 hover:text-red-600 rounded-md cursor-pointer transition-colors"
                                title="Deallocate Room"
                              >
                                <UserMinus className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Allocate Button */}
                  <div className="pt-2">
                    {!isFull ? (
                      <button
                        onClick={() => handleAllocateFromRoom(room)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" /> Allocate Resident
                      </button>
                    ) : (
                      <div className="w-full py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-455 dark:text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 select-none">
                        Room Full
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Classic Table View */}
      {viewMode === 'residents' && (
        <div className="bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 font-semibold">Student Name</th>
                  <th className="p-4 font-semibold">Affiliated Room</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {students.map((student) => {
                  const hasRoom = student.roomId && student.roomNo !== 'Unallocated';
                  const room = hasRoom ? rooms.find(r => r.roomNo === student.roomNo) : null;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold w-fit ${
                            hasRoom 
                              ? 'bg-indigo-50 dark:bg-indigo-955/45 text-indigo-650 dark:text-indigo-400' 
                              : 'bg-slate-100 dark:bg-slate-850 text-slate-450 dark:text-slate-500'
                          }`}>
                            {hasRoom ? `Room ${student.roomNo}` : 'Not Allocated'}
                          </span>
                          {hasRoom && room && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold space-y-0.5">
                              <div>Occupied: <span className="text-slate-900 dark:text-white font-bold">{room.occupied}</span></div>
                              <div>Beds Available: <span className="text-slate-900 dark:text-white font-bold">{room.capacity - room.occupied}</span></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {hasRoom ? (
                          <button
                            onClick={() => setConfirmDeallocate({ studentId: student.id, roomNo: student.roomNo })}
                            className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-650 rounded-xl text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <UserMinus className="w-3.5 h-3.5" /> Deallocate Room
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAllocateFromStudent(student)}
                            className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Key className="w-3.5 h-3.5" /> Allocate Room
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocate Room Modal (Unified) */}
      <Modal
        open={showAllocateModal}
        onOpenChange={(v) => { if (!v) { setShowAllocateModal(false); setSelectedStudent(null); setSelectedRoom(null); } }}
        title="Allocate Resident"
        description={
          selectedStudent
            ? `Choose an available room to allocate to ${selectedStudent.name}.`
            : `Choose an unallocated resident to assign to Room ${selectedRoom?.roomNo}.`
        }
        icon={Key}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => { setShowAllocateModal(false); setSelectedStudent(null); setSelectedRoom(null); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="allocate-room-form"
              loading={submittingAllocation}
              disabled={
                (selectedStudent && vacantRooms.length === 0) ||
                (selectedRoom && unallocatedStudents.length === 0)
              }
            >
              Confirm Allocation
            </Button>
          </>
        }
      >
            <form id="allocate-room-form" onSubmit={handleConfirmAllocation} className="space-y-4">
              {/* Scenario 1: Allocating a selected student to a room */}
              {selectedStudent && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">Select Vacant Room</label>
                  {vacantRooms.length === 0 ? (
                    <div className="flex gap-1.5 items-center p-3 bg-red-500/5 text-red-650 border border-red-200/50 rounded-xl text-xs font-semibold">
                      <AlertTriangle className="w-4.5 h-4.5" /> No vacant rooms available.
                    </div>
                  ) : (
                    <select
                      value={targetRoomNo}
                      onChange={(e) => setTargetRoomNo(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 text-slate-955 dark:text-white"
                    >
                      {vacantRooms.map((r) => (
                        <option key={r.id} value={r.roomNo}>
                          Room {r.roomNo} ({r.type} - {r.capacity - r.occupied} beds left)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Scenario 2: Allocating a selected room to a student */}
              {selectedRoom && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">Select Resident</label>
                  {unallocatedStudents.length === 0 ? (
                    <div className="flex gap-1.5 items-center p-3 bg-red-500/5 text-red-650 border border-red-200/50 rounded-xl text-xs font-semibold">
                      <AlertTriangle className="w-4.5 h-4.5" /> No unallocated residents available.
                    </div>
                  ) : (
                    <select
                      value={targetStudentId}
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 text-slate-955 dark:text-white"
                    >
                      {unallocatedStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.college || 'Resident'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeallocate}
        onOpenChange={(v) => !v && setConfirmDeallocate(null)}
        title="Deallocate this room?"
        description={confirmDeallocate ? `This will vacate Room ${confirmDeallocate.roomNo} for this resident.` : ''}
        confirmLabel="Deallocate"
        loading={deallocating}
        onConfirm={deallocateRoom}
      />
    </div>
  );
};

