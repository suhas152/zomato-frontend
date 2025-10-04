import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');


  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
       
        const response = await axios.get(`http://localhost:5000/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch profile.');
      }
    };

    if (userId) {
      fetchProfile();
    } else {
      setError('User not logged in.');
    }
  }, [userId]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container" style={{ 
      backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '90px',
        borderRadius: '10px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2>User Profile</h2>
        <ul className="list-group">
          <li className="list-group-item"><strong>Name:</strong> {user.name}</li>
          <li className="list-group-item"><strong>Email:</strong> {user.email}</li>
          <li className="list-group-item"><strong>Age:</strong> {user.age}</li>
          <li className="list-group-item"><strong>Gender:</strong> {user.gender}</li>
          <li className="list-group-item"><strong>Contact No:</strong> {user.contactno}</li>
          <li className="list-group-item"><strong>Address:</strong> {user.address}</li>
        </ul>
      </div>
      </div>
    );
};

export default Profile;
