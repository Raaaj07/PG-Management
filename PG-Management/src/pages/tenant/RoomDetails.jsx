import React, { useState, useEffect } from 'react';
import { db } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, Clock, AlertTriangle, ShieldCheck, Mail, Phone, Layers, Bed } from 'lucide-react';

const ROOM_IMAGES = {
  '101': 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=60',
  '102': 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=60',
  '103': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=60',
  '104': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=60',
  '201': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=60',
  '202': 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&auto=format&fit=crop&q=60'
};

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=60';

export default function RoomDetails() {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [hostelInfo, setHostelInfo] = useState(null);
  const [allRooms, setAllRooms] = useState([]);

  useEffect(() => {
    const rooms = db.getRooms();
    setAllRooms(rooms);
    const myRoom = rooms.find(r => r.id === user.roomId || r.roomNo === user.roomNo);
    setRoom(myRoom);

    const users = db.getUsers();
    setAllUsers(users);

    // Find hostel rules and curfew
    const allHostels = db.getHostels();
    const myHostel = allHostels.find(h => h.id === user.hostelId);
    setHostelInfo(myHostel);
  }, [user]);

  // Total vacant beds in the hostel
  const totalVacantBeds = allRooms.reduce((acc, r) => acc + (r.capacity - r.occupied), 0);
  // Total vacant rooms (rooms with at least one vacant bed)
  const totalVacantRooms = allRooms.filter(r => r.occupied < r.capacity).length;

  // Group by room types to get varieties
  const roomVarietiesMap = allRooms.reduce((acc, r) => {
    const key = `${r.type}-${r.ac ? 'AC' : 'Non-AC'}`;
    if (!acc[key]) {
      acc[key] = { type: r.type, ac: r.ac, total: 0, vacantBeds: 0, rent: r.rent };
    }
    acc[key].total += 1;
    acc[key].vacantBeds += (r.capacity - r.occupied);
    return acc;
  }, {});

  const roomVarieties = Object.values(roomVarietiesMap);
  const getRoomImage = (roomNo) => ROOM_IMAGES[roomNo] || DEFAULT_ROOM_IMAGE;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Room Information</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Check roommate logs, property curfew parameters, and details for room {room?.roomNo || 'N/A'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Room details card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {allRooms.map((r) => {
              const isMyRoom = r.id === user.roomId || r.roomNo === user.roomNo;
              const isFull = r.occupied >= r.capacity;
              const roomStudents = allUsers.filter(u => (u.roomId === r.id || u.roomNo === r.roomNo) && u.role === 'student');
              const image = getRoomImage(r.roomNo);

              return (
                <div 
                  key={r.id} 
                  className={`bg-white dark:bg-slate-955 rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group ${
                    isMyRoom 
                      ? 'border-indigo-500/80 ring-2 ring-indigo-500/10' 
                      : 'border-slate-200 dark:border-slate-850'
                  }`}
                >
                  {/* Airbnb Image Section */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img 
                      src={image} 
                      alt={`Room ${r.roomNo}`}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-350"
                    />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                        r.ac 
                          ? 'bg-sky-500/90 text-white shadow-sm' 
                          : 'bg-slate-655/90 text-white shadow-sm'
                      }`}>
                        {r.ac ? 'AC' : 'Non-AC'}
                      </span>
                      {isMyRoom && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-indigo-650 text-white shadow-md">
                          Your Room
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-bold text-xs">
                      Room {r.roomNo}
                    </div>
                  </div>

                  {/* Airbnb Details Section */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{r.floor}</span>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">{r.type}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Monthly Rent</span>
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white">₹{r.rent}</p>
                        </div>
                      </div>

                      {/* Bed Slots occupancy layout */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider">Bed Slot Occupancy</span>
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white">{r.occupied} / {r.capacity} Beds</span>
                        </div>
                        <div className="flex gap-1.5">
                          {Array.from({ length: r.capacity }).map((_, idx) => {
                            const isOccupied = idx < r.occupied;
                            return (
                              <div 
                                key={idx} 
                                className={`flex-grow p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                                  isOccupied 
                                    ? 'bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white' 
                                    : 'bg-transparent border-dashed border-slate-200 dark:border-slate-800 text-slate-350 dark:text-slate-600'
                                }`}
                              >
                                <Bed className="w-4.5 h-4.5 shrink-0" />
                                <span className="text-[7px] font-bold uppercase tracking-wider select-none">
                                  {isOccupied ? 'Occupied' : 'Vacant'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Room occupants list */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[9px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Allocated Residents</span>
                        {roomStudents.length === 0 ? (
                          <p className="text-[9px] text-slate-400 italic">No residents allocated yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {roomStudents.map(student => {
                              const isMe = student.id === user.id;
                              return (
                                <div 
                                  key={student.id} 
                                  className={`flex items-center justify-between p-1.5 rounded-xl border transition-colors ${
                                    isMe 
                                      ? 'bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-200/40 dark:border-indigo-900/20' 
                                      : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-850'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <img src={student.avatar} alt={student.name} className="w-5.5 h-5.5 rounded-full object-cover" />
                                    <span className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                                      {student.name} {isMe && <span className="text-[8px] bg-indigo-100 dark:bg-indigo-955 text-indigo-650 dark:text-indigo-400 px-1 py-0.5 rounded font-bold ml-0.5">You</span>}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[90px]">{student.phone || 'No phone'}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Policies & Hostel overview cards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-xs space-y-4 h-fit">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-855 pb-3">
              <Clock className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
              Curfew & Gate Guidelines
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-red-500/5 dark:bg-red-955/10 border border-red-200/50 dark:border-red-900/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Curfew Hours
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white text-base">
                  Gate closes at {hostelInfo?.curfewTime || '10:00 PM'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Residents returning after cutoff will face an automated late entry fine of ₹{hostelInfo?.lateFine || '200'}.
                </p>
              </div>

              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-955/10 border border-emerald-200/50 dark:border-emerald-900/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> General Guest Policy
                </span>
                <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
                  {hostelInfo?.guestPolicy || 'Allowed until 8:00 PM. Overnight stays require prior approval.'}
                </p>
              </div>
            </div>
          </div>

          {/* Vacancy & Varieties Card */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-855 pb-3">
              <Layers className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
              PG Vacancies & Varieties
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              {/* Stat overview cards */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-slate-455 block mb-0.5">Vacant Rooms</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{totalVacantRooms} Rooms</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-slate-455 block mb-0.5">Vacant Beds</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{totalVacantBeds} Beds</span>
                </div>
              </div>

              {/* Varieties list */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-455 uppercase tracking-wider block">Available Room Varieties</span>
                <div className="space-y-2">
                  {roomVarieties.map((variety, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-850">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {variety.type}
                        </div>
                        <div className="text-[9px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">
                          {variety.ac ? 'AC Room' : 'Non-AC'} • {variety.total} rooms total
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">₹{variety.rent}/mo</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 ${
                          variety.vacantBeds > 0 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {variety.vacantBeds > 0 ? `${variety.vacantBeds} beds vacant` : 'No Vacancy'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
