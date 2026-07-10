import React, { useState, useEffect } from 'react';
import { Target, Sparkles, MapPin, ShieldCheck, Heart } from 'lucide-react';
import client from '../../api/client';

export const AboutPage = () => {
  const [pgName, setPgName] = useState('Elite Residency PG');
  
  useEffect(() => {
    const fetchHostelInfo = async () => {
      try {
        const response = await client.get('/hostels');
        if (response.data.data && response.data.data.length > 0) {
          setPgName(response.data.data[0].name);
        }
      } catch (err) {
        console.error('Failed to load hostel info:', err);
      }
    };
    fetchHostelInfo();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
            About {pgName}
          </h1>
          <p className="text-sm sm:text-base text-slate-550 dark:text-slate-400 mt-4 leading-relaxed">
            Providing premium, safe, and comfortable co-living accommodation for students and working professionals.
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-slate-655 dark:text-slate-350 space-y-6 leading-relaxed">
          <p className="text-sm sm:text-base">
            Established with a vision to redefine co-living accommodations, {pgName} offers fully managed residencies that feel just like home. We understand the challenges of relocation, which is why we handle all aspects of housekeeping, meal preparation, security, and amenities.
          </p>
          <p className="text-sm sm:text-base">
            Whether you are a student focused on academics or a young professional building your career, we provide a quiet, fully furnished environment equipped with dedicated study desks, high-speed WiFi, laundry systems, and split AC units to ensure your comfortable stay.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
            <div className="p-6 bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850">
              <div className="flex gap-3 items-center mb-4 text-indigo-650 dark:text-indigo-400">
                <Target className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Our Mission</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                To offer high-quality, clean, and modern rooms combined with delicious, home-style meals, easing the relocation experience.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850">
              <div className="flex gap-3 items-center mb-4 text-indigo-650 dark:text-indigo-400">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Safety First</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                With 24/7 CCTV surveillance, gate registers, warden checks, and secure visitor protocols, we make safety our highest priority.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850">
              <div className="flex gap-3 items-center mb-4 text-indigo-650 dark:text-indigo-400">
                <Heart className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Healthy Living</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We focus on resident well-being with hygiene-certified kitchens, regular cleaning cycles, and community notice sharing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
