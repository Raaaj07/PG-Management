import client from '../api/client';

export const db = {
  getHostels: async () => {
    const res = await client.get('/hostels');
    return res.data.data;
  },
  saveHostels: async (data) => {
    const hostel = data[0];
    if (hostel) {
      await client.put(`/hostels/${hostel.id}`, hostel);
    }
  },

  getUsers: async () => {
    const res = await client.get('/users');
    return res.data.data;
  },
  saveUsers: async (data) => {
    // If a user list is saved, update them individually via PUT
    for (const u of data) {
      if (u.id) {
        await client.put(`/users/${u.id}`, u).catch(() => {});
      }
    }
  },

  getRooms: async () => {
    const res = await client.get('/rooms');
    return res.data.data;
  },
  saveRooms: async (data) => {
    // Fallback sync for rooms list
    for (const r of data) {
      if (r.id) {
        await client.put(`/rooms/${r.id}`, r).catch(() => {});
      }
    }
  },

  getFees: async () => {
    const res = await client.get('/fees');
    return res.data.data;
  },
  saveFees: async (data) => {
    for (const f of data) {
      if (f.id) {
        await client.put(`/fees/${f.id}`, f).catch(() => {});
      }
    }
  },

  getComplaints: async () => {
    const res = await client.get('/complaints');
    return res.data.data;
  },
  saveComplaints: async (data) => {
    for (const c of data) {
      if (c.id) {
        await client.put(`/complaints/${c.id}`, c).catch(() => {});
      }
    }
  },

  getLeaves: async () => {
    const res = await client.get('/leaves');
    return res.data.data;
  },
  saveLeaves: async (data) => {
    for (const l of data) {
      if (l.id) {
        await client.put(`/leaves/${l.id}`, l).catch(() => {});
      }
    }
  },

  getVisitors: async () => {
    const res = await client.get('/visitors');
    return res.data.data;
  },
  saveVisitors: async (data) => {
    for (const v of data) {
      if (v.id) {
        await client.put(`/visitors/${v.id}`, v).catch(() => {});
      }
    }
  },

  getNotices: async () => {
    const res = await client.get('/notices');
    return res.data.data;
  },
  saveNotices: async (data) => {
    for (const n of data) {
      if (n.id) {
        await client.put(`/notices/${n.id}`, n).catch(() => {});
      }
    }
  },

  getSubscriptionPlans: async () => {
    const res = await client.get('/plans');
    return res.data.data;
  },
  saveSubscriptionPlans: async (data) => {
    for (const p of data) {
      if (p.id) {
        await client.put(`/plans/${p.id}`, p).catch(() => {});
      }
    }
  },
};
