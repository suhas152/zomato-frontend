import React from 'react';

const demoImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
   "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
];

export default function Orders() {
  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 text-success mb-3">
          <span role="img" aria-label="success">✅</span>
          <br />
          Order Placed Successfully!
        </h1>
        <p className="lead">
          Thank you for your order.<br />
          Your delicious food is being prepared and will be delivered soon.<br />
          <span role="img" aria-label="food">🍕🍔🍟🍜</span>
        </p>
        <div className="d-flex justify-content-center gap-4 mt-4">
          {demoImages.map((img, idx) => (
            <div key={idx} className="card shadow" style={{ width: 180 }}>
              <img src={img} className="card-img-top" alt="Delicious food" style={{ height: 120, objectFit: 'cover' }} />
              <div className="card-body p-2">
                <div className="fw-bold text-center">Tasty Meal</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}