import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Restaurent from './Restaurent';
import { Link } from 'react-router-dom';

export default function Restaurents() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/restaurants');
        setRestaurants(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      padding: '40px 0'
    }}>
      <div className="container" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
        <h2 className="text-center mb-4">Restaurants</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="row g-4">
            {restaurants.map((rest) => (
              <div className="col-md-4 mb-4" key={rest._id}>
                <Restaurent
                  id={rest._id}
                  name={rest.name}
                  address={rest.address}
                  imageUrl={rest.imageUrl || 'https://via.placeholder.com/300x200?text=Restaurant'}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No restaurants found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
