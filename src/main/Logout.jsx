import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // Also clear admin authentication data if it exists
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    
    // Redirect to home page
    navigate('/');
  };

  // Automatically logout when component mounts
  React.useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="container mt-5 text-center">
      <div className="alert alert-success">
        <h4>Logged Out Successfully</h4>
        <p>You have been logged out of your account.</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default Logout;