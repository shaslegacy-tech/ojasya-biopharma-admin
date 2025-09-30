'use client';


import { useEffect, useState } from 'react';
import api from '@/lib/api';


export default function Profile() {
type Profile = {
  name?: string;
  email?: string;
  role?: string;
};

const [profile, setProfile] = useState<Profile>({});


useEffect(() => {
  api.get('/hospital/profile').then(res => setProfile(res.data as Profile));
}, []);


return (
<div className="bg-white p-6 rounded-lg shadow">
<h2 className="text-xl font-bold mb-4">Profile</h2>
<p><strong>Name:</strong> {profile.name}</p>
<p><strong>Email:</strong> {profile.email}</p>
<p><strong>Role:</strong> {profile.role}</p>
</div>
);
}