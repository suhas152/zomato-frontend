import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Restaurent({ id, name, address, imageUrl }) {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (id) {
      navigate(`/restaurant/${id}`);
    } else {
      console.error('Restaurant ID is missing');
    }
  };

  return (
    <div className="card restaurant-card h-100">
      <img 
        src={imageUrl || 'https://via.placeholder.com/300x200?text=Restaurant'}
        alt={name}
        className="card-img-top"
        style={{ height: '200px', objectFit: 'cover' }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/300x200?text=Restaurant';
        }}
      />
      <div className="card-body">
        <h3 className="card-title">{name}</h3>
        <p className="card-text">{address}</p>
        <button
          className="btn btn-primary w-100"
          onClick={handleExplore}
          disabled={!id}
        >
          Explore
        </button>
      </div>
    </div>
  );
}