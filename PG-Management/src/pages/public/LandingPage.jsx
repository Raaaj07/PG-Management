import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../../api/client';
import { 
  Building, ShieldCheck, Zap, Users, ChevronRight, Star, 
  Wifi, Coffee, Flame, HeartHandshake, Eye, MapPin, Clock 
} from 'lucide-react';

export const LandingPage = () => {
  const [pgInfo, setPgInfo] = useState({
    name: 'Elite Residency PG',
    address: 'Sector 62, Noida, UP',
    curfewTime: '10:00 PM',
    type: 'PG'
  });

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [hostelsRes, roomsRes] = await Promise.all([
          client.get('/hostels'),
          client.get('/rooms')
        ]);

        const hostels = hostelsRes.data.data;
        if (hostels && hostels.length > 0) {
          setPgInfo({
            name: hostels[0].name,
            address: hostels[0].address,
            curfewTime: hostels[0].curfewTime || '10:00 PM',
            type: hostels[0].type || 'PG'
          });
        }
        setRooms(roomsRes.data.data);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      }
    };
    fetchLandingData();
  }, []);

  const amenities = [
    {
      icon: Wifi,
      title: 'High-Speed WiFi',
      desc: 'Seamless 200+ Mbps dedicated fiber internet access across all rooms and common areas.',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Coffee,
      title: 'Nutritious Meals',
      desc: 'Hygiene-certified kitchen serving delicious breakfast, lunch, and dinner daily.',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      icon: ShieldCheck,
      title: '24/7 Security & CCTV',
      desc: 'Secure gated facility monitored by professional wardens and continuous camera coverage.',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Flame,
      title: 'Power & Water Backup',
      desc: '100% power generators and heavy capacity water storage for zero interruptions.',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      icon: HeartHandshake,
      title: 'Daily Housekeeping',
      desc: 'Professional cleaning staff for rooms and washrooms, with laundry collection.',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: Clock,
      title: 'Flexible Leave Tracking',
      desc: 'Apply for night-outs and weekend leaves directly via our digital tenant portal.',
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none opacity-40 dark:opacity-30">
          <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-indigo-400/35 filter blur-[90px]" />
          <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-violet-400/30 filter blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-55/60 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6"
          >
            <MapPin className="w-3.5 h-3.5" />
            {pgInfo.address}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white max-w-4xl mx-auto"
          >
            Experience Premium Co-Living at{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {pgInfo.name}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Welcome to the city's finest co-living facility. We offer fully furnished AC rooms, high-speed internet, nutritious home-style meals, and 24/7 security tailored for students and working professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-700/30 transition-all flex items-center justify-center gap-2"
            >
              Sign In to Tenant Portal
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-805 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center"
            >
              Apply for Admission
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Details Bar */}
      <section className="bg-white dark:bg-slate-955 border-y border-slate-200 dark:border-slate-850 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-850">
            <div className="py-4 sm:py-0">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Property Type</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">Luxury Co-Living ({pgInfo.type})</span>
            </div>
            <div className="py-4 sm:py-0">
              <span className="text-xs text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider block">Curfew Gate Timings</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">Strictly {pgInfo.curfewTime}</span>
            </div>
            <div className="py-4 sm:py-0">
              <span className="text-xs text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider block">Available Rooms</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">{rooms.length || 6} Premium Suites</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Amenities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Premium Amenities Included
          </h2>
          <p className="text-sm sm:text-base text-slate-550 dark:text-slate-400 mt-4 leading-relaxed">
            Every room includes access to all shared utilities. No hidden charges. Enjoy a worry-free stay with everything handled professionally by our onsite staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((h, idx) => {
            const Icon = h.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
                className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-8 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-slate-350 dark:hover:border-slate-800 transition-all group"
              >
                <div className={`p-3.5 rounded-xl shrink-0 w-fit ${h.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                    {h.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Room Options Preview */}
      <section className="bg-white dark:bg-slate-955 border-t border-slate-200 dark:border-slate-850 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Room Sharing & Categories
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              Choose the accommodation style that fits your budget. AC and Non-AC variants are available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:scale-[1.02] transition-all">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">Elite Privacy</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Single Room</h3>
                <p className="text-xs text-slate-500 mt-2">Private room with study desk, wardrobe, AC, and attached washroom.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$18,000</span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
                </div>
              </div>
              <Link to="/register" className="w-full text-center py-2.5 mt-8 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 shadow-md">Book Now</Link>
            </div>

            <div className="p-6 bg-indigo-950 text-white rounded-3xl border border-indigo-900 flex flex-col justify-between hover:scale-[1.02] transition-all shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
              <div>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-900/60 px-3 py-1 rounded-full">Vibrant & Social</span>
                <h3 className="text-xl font-bold mt-4">Double Sharing Room</h3>
                <p className="text-xs text-indigo-200 mt-2">Shared room for two. Includes individual wardrobes, study tables, and premium split AC.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">$12,000</span>
                  <span className="text-xs text-indigo-300 font-semibold">/ month</span>
                </div>
              </div>
              <Link to="/register" className="w-full text-center py-2.5 mt-8 bg-white text-indigo-950 font-bold rounded-xl text-xs hover:bg-slate-100 shadow-md">Book Now</Link>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:scale-[1.02] transition-all">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">Budget Friendly</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Triple Sharing Room</h3>
                <p className="text-xs text-slate-500 mt-2">Spacious shared room for three. Furnished with individual beds, cupboards, and high-speed ceiling fans.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">$7,500</span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
                </div>
              </div>
              <Link to="/register" className="w-full text-center py-2.5 mt-8 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 shadow-md">Book Now</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
