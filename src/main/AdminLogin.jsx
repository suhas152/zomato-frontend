import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    // Check if admin is already logged in
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            // Admin is already logged in
            // You could redirect or show a message
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Submitting admin login:', formData);
            const response = await axios.post('http://localhost:5000/admin/login', formData);
            console.log('Admin login response:', response.data);
            if (response.data.admin) {
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminId', response.data.admin.id);
                localStorage.setItem('adminUsername', response.data.admin.username);
                navigate('/admin/dashboard');
            } else {
                setError('Invalid response from server');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
        }
    };

    // Add logout function
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminUsername');
        navigate('/admin/login');
    };

    return (
        <div className="container-fluid p-0" style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="register-form" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '30px',
                borderRadius: '10px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)'
            }}>
                <h2 className="text-center mb-4">Admin Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;