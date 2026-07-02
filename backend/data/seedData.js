export const initialHostels = [
  { id: 'hostel-1', name: 'Elite Residency PG', type: 'PG', address: 'Sector 62, Noida, UP', roomsCount: 25, activeStudents: 18, status: 'Active', curfewTime: '10:00 PM', lateFine: '200', guestPolicy: 'Allowed until 8:00 PM. Overnight stay requires prior approval.' }
];

export const initialUsers = [
  { id: 'user-2', name: 'Vikram Malhotra', email: 'admin@test.com', role: 'hostel-admin', hostelId: 'hostel-1', hostelName: 'Elite Residency PG', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60', phone: '+91 99999 88888' },
  { id: 'user-3', name: 'Rajesh Kumar', email: 'warden@test.com', role: 'warden', hostelId: 'hostel-1', hostelName: 'Elite Residency PG', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', phone: '+91 99999 77777' },
  { id: 'user-4', name: 'Rohan Mehra', email: 'student@test.com', role: 'student', hostelId: 'hostel-1', hostelName: 'Elite Residency PG', roomId: 'room-101', roomNo: '101', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60', phone: '+91 98765 43210', emergencyContact: '+91 98765 00000', college: 'Amity University' },
  { id: 'user-5', name: 'Aman Verma', email: 'aman@test.com', role: 'student', hostelId: 'hostel-1', hostelName: 'Elite Residency PG', roomId: 'room-102', roomNo: '102', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60', phone: '+91 98765 11111', emergencyContact: '+91 98765 00011', college: 'Software Engineer at TCS' },
  { id: 'user-6', name: 'Neha Gupta', email: 'neha@test.com', role: 'student', hostelId: 'hostel-1', hostelName: 'Elite Residency PG', roomId: 'room-103', roomNo: '103', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', phone: '+91 98765 22222', emergencyContact: '+91 98765 00022', college: 'Amity University' }
];

export const initialRooms = [
  { id: 'room-101', roomNo: '101', type: 'Double Sharing', floor: '1st Floor', ac: true, rent: 12000, capacity: 2, occupied: 2, hostelId: 'hostel-1' },
  { id: 'room-102', roomNo: '102', type: 'Single Room', floor: '1st Floor', ac: true, rent: 18000, capacity: 1, occupied: 1, hostelId: 'hostel-1' },
  { id: 'room-103', roomNo: '103', type: 'Double Sharing', floor: '1st Floor', ac: false, rent: 9000, capacity: 2, occupied: 1, hostelId: 'hostel-1' },
  { id: 'room-104', roomNo: '104', type: 'Triple Sharing', floor: '1st Floor', ac: false, rent: 7500, capacity: 3, occupied: 0, hostelId: 'hostel-1' },
  { id: 'room-201', roomNo: '201', type: 'Double Sharing', floor: '2nd Floor', ac: true, rent: 12500, capacity: 2, occupied: 1, hostelId: 'hostel-1' },
  { id: 'room-202', roomNo: '202', type: 'Single Room', floor: '2nd Floor', ac: false, rent: 14000, capacity: 1, occupied: 0, hostelId: 'hostel-1' }
];

export const initialFees = [
  { id: 'fee-1', studentId: 'user-4', studentName: 'Rohan Mehra', amount: 12000, month: 'June 2026', status: 'Paid', date: '2026-06-05', invoiceNo: 'INV-2026-001' },
  { id: 'fee-2', studentId: 'user-4', studentName: 'Rohan Mehra', amount: 12000, month: 'May 2026', status: 'Paid', date: '2026-05-03', invoiceNo: 'INV-2026-015' },
  { id: 'fee-3', studentId: 'user-5', studentName: 'Aman Verma', amount: 18000, month: 'June 2026', status: 'Unpaid', date: null, invoiceNo: 'INV-2026-002' },
  { id: 'fee-4', studentId: 'user-6', studentName: 'Neha Gupta', amount: 9000, month: 'June 2026', status: 'Pending Review', date: '2026-06-18', invoiceNo: 'INV-2026-003' }
];

export const initialComplaints = [
  { id: 'comp-1', studentId: 'user-4', studentName: 'Rohan Mehra', roomNo: '101', title: 'WiFi router not working', category: 'Internet', description: 'The WiFi signal in room 101 keeps disconnecting frequently and speed is less than 1Mbps.', priority: 'Medium', status: 'In Progress', date: '2026-06-18', reply: 'Warden assigned to check the router settings.' },
  { id: 'comp-2', studentId: 'user-5', studentName: 'Aman Verma', roomNo: '102', title: 'AC leaking water', category: 'Electrical', description: 'AC unit in room 102 leaks water inside the room whenever it runs.', priority: 'High', status: 'Pending', date: '2026-06-19', reply: null },
  { id: 'comp-3', studentId: 'user-6', studentName: 'Neha Gupta', roomNo: '103', title: 'Washroom tap leaking', category: 'Plumbing', description: 'The tap in the attached washroom has a constant leak wasting water.', priority: 'Low', status: 'Resolved', date: '2026-06-15', reply: 'Plumber visited and replaced the washer.' }
];

export const initialLeaves = [
  { id: 'leave-1', studentId: 'user-4', studentName: 'Rohan Mehra', roomNo: '101', startDate: '2026-06-25', endDate: '2026-06-28', reason: 'Going home for sibling birthday celebration.', status: 'Pending', date: '2026-06-19' },
  { id: 'leave-2', studentId: 'user-5', studentName: 'Aman Verma', roomNo: '102', startDate: '2026-06-10', endDate: '2026-06-14', reason: 'College academic seminar in Pune.', status: 'Approved', date: '2026-06-08' },
  { id: 'leave-3', studentId: 'user-6', studentName: 'Neha Gupta', roomNo: '103', startDate: '2026-06-01', endDate: '2026-06-03', reason: 'Family medical emergency.', status: 'Approved', date: '2026-05-30' }
];

export const initialVisitors = [
  { id: 'vis-1', studentId: 'user-4', studentName: 'Rohan Mehra', roomNo: '101', visitorName: 'Suresh Mehra', relation: 'Father', date: '2026-06-20', inTime: '10:00 AM', outTime: '02:00 PM', purpose: 'Delivery of home food and luggage check', status: 'Checked Out' },
  { id: 'vis-2', studentId: 'user-5', studentName: 'Aman Verma', roomNo: '102', visitorName: 'Rahul Sen', relation: 'Friend', date: '2026-06-20', inTime: '03:30 PM', outTime: null, purpose: 'Group project study session', status: 'Checked In' },
  { id: 'vis-3', studentId: 'user-6', studentName: 'Neha Gupta', roomNo: '103', visitorName: 'Sanjana Gupta', relation: 'Mother', date: '2026-06-18', inTime: '01:00 PM', outTime: '05:00 PM', purpose: 'General visit', status: 'Checked Out' }
];

export const initialNotices = [
  { id: 'not-1', title: 'Maintenance Notice - Water Supply', content: 'Water tank cleaning will take place on Sunday, 22nd June from 9:00 AM to 1:00 PM. Please store water in advance.', date: '2026-06-20', createdBy: 'Hostel Admin', target: 'All' },
  { id: 'not-2', title: 'Gate Timings Strict Adherence', content: 'Please ensure you check in before 10:00 PM. Wardens will report late entries to the management starting next week.', date: '2026-06-19', createdBy: 'Warden', target: 'Students' },
  { id: 'not-3', title: 'Warden Meeting with Hostel Management', content: 'Monthly review meeting scheduled in the main office on Monday, 23rd June at 4 PM.', date: '2026-06-18', createdBy: 'Hostel Admin', target: 'Staff' }
];

export const initialSubscriptionPlans = [
  { id: 'plan-1', name: 'Standard Plan', price: 49, interval: 'month', features: ['Up to 50 rooms', 'Basic reports', 'Student & Room Management', 'Leave Tracker', 'Support via email'], popular: false },
  { id: 'plan-2', name: 'Professional Plan', price: 99, interval: 'month', features: ['Up to 200 rooms', 'Advanced analytics & reports', 'Complete module access', 'Warden Portal included', 'Priority email support', 'Visitor Log tracking'], popular: true },
  { id: 'plan-3', name: 'Enterprise Plan', price: 199, interval: 'month', features: ['Unlimited rooms', 'Custom reports & dashboards', 'Multi-property management', 'SMS/Email Alerts gateway', 'Dedicated accounts manager', '24/7 Phone support'], popular: false }
];
