import React from 'react';
import { ShieldCheck, Users, Bed, CreditCard, ClipboardList, Send, KeyRound } from 'lucide-react';

export const FeaturesPage = () => {
  const sections = [
    {
      title: 'For PG & Hostel Owners (Admins)',
      subtitle: 'Complete administrative control over properties, billing, and residents.',
      features: [
        { icon: Users, name: 'Student Management', desc: 'Maintain complete resident records, emergency contacts, college details, and check-in documentation.' },
        { icon: Bed, name: 'Room & Floor Management', desc: 'Define AC/Non-AC rooms, double/triple sharing layouts, room pricing, and monitor real-time availability.' },
        { icon: KeyRound, name: 'Room Allocation Engine', desc: 'Dynamically allocate rooms to students. Switch occupants or manage vacancy statuses instantly.' },
        { icon: CreditCard, name: 'Rent & Fee Tracking', desc: 'Generate monthly invoices automatically. Record receipts, send reminder alerts, and check pending payment lists.' }
      ]
    },
    {
      title: 'For Wardens',
      subtitle: 'Tools to monitor daily activities, track visitor check-ins, and resolve complaints.',
      features: [
        { icon: ClipboardList, name: 'Daily Attendance', desc: 'Take daily attendance logs, log resident check-in/out times, and monitor absences.' },
        { icon: Send, name: 'Leave Processing', desc: 'Approve or reject leave applications based on resident notes and parent emergency details.' },
        { icon: Users, name: 'Visitor Logbook', desc: 'Record guest details, check-in timestamps, purpose of visit, and track exit check-outs.' },
        { icon: ShieldCheck, name: 'Complaint Redressal', desc: 'Coordinate repairs, assign local technicians, and update status of student complaints.' }
      ]
    },
    {
      title: 'For Student Residents',
      subtitle: 'A clean portal to manage accommodation details, fees, and communication.',
      features: [
        { icon: Bed, name: 'Room & Roommates info', desc: 'Access room amenities, landlord check-in instructions, and view roommate profiles.' },
        { icon: CreditCard, name: 'Online Invoicing', desc: 'View unpaid rent details, check bill history, and trigger mock transactions.' },
        { icon: ClipboardList, name: 'Complaint Filing', desc: 'Lodge repair requests with photos and titles. Monitor resolved comments from Wardens.' },
        { icon: Send, name: 'Leave Application', desc: 'Submit out-of-station leave requests, parent emergency contacts, and track approval status.' }
      ]
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
            Feature-Rich Platform
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
            HostelSync automates every operational touchpoint in PG and Hostel properties. Check out features built for every stakeholder role.
          </p>
        </div>

        <div className="space-y-20">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="border-b border-slate-200 dark:border-slate-800 pb-12 last:border-0 last:pb-0">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
                <p className="text-sm text-slate-550 dark:text-slate-400 mt-2">{section.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.features.map((f, fIdx) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={fIdx}
                      className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 flex gap-4 items-start shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">{f.name}</h3>
                        <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
