import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [activeTab, setActiveTab] = useState('restaurants');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [restaurantForm, setRestaurantForm] = useState({
        name: '',
        address: '',
        cuisine: '',
        imageUrl: ''
    });
    const [menuItemForm, setMenuItemForm] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
    });
    const [showRestaurantForm, setShowRestaurantForm] = useState(false);
    const [showMenuItemForm, setShowMenuItemForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);

    // Check if admin is logged in
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
        } else {
            fetchRestaurants();
        }
    }, [navigate]);

    // Fetch restaurants
    const fetchRestaurants = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/restaurants');
            setRestaurants(response.data);
            setIsLoading(false);
        } catch (error) {
            setError('Failed to fetch restaurants');
            setIsLoading(false);
        }
    };

    // Fetch menu items for a restaurant
    const fetchMenuItems = async (restaurantId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/restaurants/${restaurantId}/menuitems`);
            setMenuItems(response.data);
            setIsLoading(false);
        } catch (error) {
            setError('Failed to fetch menu items');
            setIsLoading(false);
        }
    };

    // Handle restaurant selection
    const handleRestaurantSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        fetchMenuItems(restaurant._id);
        setActiveTab('menuItems');
    };

    // Handle restaurant form change
    const handleRestaurantFormChange = (e) => {
        setRestaurantForm({
            ...restaurantForm,
            [e.target.name]: e.target.value
        });
    };

    // Handle menu item form change
    const handleMenuItemFormChange = (e) => {
        setMenuItemForm({
            ...menuItemForm,
            [e.target.name]: e.target.value
        });
    };

    // Add or update restaurant
    const handleRestaurantSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`http://localhost:5000/admin/restaurants/${currentItemId}`, restaurantForm);
            } else {
                await axios.post('http://localhost:5000/admin/restaurants', restaurantForm);
            }
            setShowRestaurantForm(false);
            setRestaurantForm({ name: '', address: '', cuisine: '', imageUrl: '' });
            setEditMode(false);
            setCurrentItemId(null);
            fetchRestaurants();
        } catch (error) {
            setError('Failed to save restaurant');
        }
    };

    // Add or update menu item
    const handleMenuItemSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`http://localhost:5000/admin/menuitems/${currentItemId}`, menuItemForm);
            } else {
                await axios.post(`http://localhost:5000/admin/restaurants/${selectedRestaurant._id}/menuitems`, menuItemForm);
            }
            setShowMenuItemForm(false);
            setMenuItemForm({ name: '', description: '', price: '', imageUrl: '' });
            setEditMode(false);
            setCurrentItemId(null);
            fetchMenuItems(selectedRestaurant._id);
        } catch (error) {
            setError('Failed to save menu item');
        }
    };

    // Edit restaurant
    const handleEditRestaurant = (restaurant) => {
        setRestaurantForm({
            name: restaurant.name,
            address: restaurant.address,
            cuisine: restaurant.cuisine,
            imageUrl: restaurant.imageUrl
        });
        setEditMode(true);
        setCurrentItemId(restaurant._id);
        setShowRestaurantForm(true);
    };

    // Edit menu item
    const handleEditMenuItem = (menuItem) => {
        setMenuItemForm({
            name: menuItem.name,
            description: menuItem.description,
            price: menuItem.price,
            imageUrl: menuItem.imageUrl
        });
        setEditMode(true);
        setCurrentItemId(menuItem._id);
        setShowMenuItemForm(true);
    };

    // Delete restaurant
    const handleDeleteRestaurant = async (restaurantId) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            try {
                await axios.delete(`http://localhost:5000/admin/restaurants/${restaurantId}`);
                fetchRestaurants();
            } catch (error) {
                setError('Failed to delete restaurant');
            }
        }
    };

    // Delete menu item
    const handleDeleteMenuItem = async (menuItemId) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                await axios.delete(`http://localhost:5000/admin/menuitems/${menuItemId}`);
                fetchMenuItems(selectedRestaurant._id);
            } catch (error) {
                setError('Failed to delete menu item');
            }
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        navigate('/admin/login');
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="admin-controls">
                    <span>Welcome, {localStorage.getItem('adminUsername')}</span>
                    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                </div>
            </header>

            <div className="admin-tabs">
                <button 
                    className={activeTab === 'restaurants' ? 'active' : ''} 
                    onClick={() => setActiveTab('restaurants')}
                >
                    Restaurants
                </button>
                {selectedRestaurant && (
                    <button 
                        className={activeTab === 'menuItems' ? 'active' : ''} 
                        onClick={() => setActiveTab('menuItems')}
                    >
                        Menu Items for {selectedRestaurant.name}
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {activeTab === 'restaurants' && (
                <div className="restaurants-section">
                    <div className="section-header">
                        <h2>Restaurants</h2>
                        <button 
                            onClick={() => {
                                setShowRestaurantForm(true);
                                setEditMode(false);
                                setRestaurantForm({ name: '', address: '', cuisine: '', imageUrl: '' });
                            }} 
                            className="btn btn-primary"
                        >
                            Add Restaurant
                        </button>
                    </div>

                    {showRestaurantForm && (
                        <div className="form-container">
                            <h3>{editMode ? 'Edit Restaurant' : 'Add Restaurant'}</h3>
                            <form onSubmit={handleRestaurantSubmit}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={restaurantForm.name} 
                                        onChange={handleRestaurantFormChange} 
                                        className="form-control" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        value={restaurantForm.address} 
                                        onChange={handleRestaurantFormChange} 
                                        className="form-control" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cuisine</label>
                                    <input 
                                        type="text" 
                                        name="cuisine" 
                                        value={restaurantForm.cuisine} 
                                        onChange={handleRestaurantFormChange} 
                                        className="form-control" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input 
                                        type="text" 
                                        name="imageUrl" 
                                        value={restaurantForm.imageUrl} 
                                        onChange={handleRestaurantFormChange} 
                                        className="form-control" 
                                    />
                                </div>
                                <div className="form-buttons">
                                    <button type="submit" className="btn btn-success">Save</button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowRestaurantForm(false)} 
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {isLoading ? (
                        <p>Loading restaurants...</p>
                    ) : (
                        <div className="restaurants-list">
                            {restaurants.length === 0 ? (
                                <p>No restaurants found.</p>
                            ) : (
                                <div className="row">
                                    {restaurants.map(restaurant => (
                                        <div key={restaurant._id} className="col-md-4 mb-4">
                                            <div className="card">
                                                {restaurant.imageUrl && (
                                                    <img 
                                                        src={restaurant.imageUrl} 
                                                        className="card-img-top" 
                                                        alt={restaurant.name} 
                                                    />
                                                )}
                                                <div className="card-body">
                                                    <h5 className="card-title">{restaurant.name}</h5>
                                                    <p className="card-text">Cuisine: {restaurant.cuisine}</p>
                                                    <p className="card-text">Address: {restaurant.address}</p>
                                                    <div className="card-actions">
                                                        <button 
                                                            onClick={() => handleRestaurantSelect(restaurant)} 
                                                            className="btn btn-info"
                                                        >
                                                            View Menu
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEditRestaurant(restaurant)} 
                                                            className="btn btn-warning"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteRestaurant(restaurant._id)} 
                                                            className="btn btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'menuItems' && selectedRestaurant && (
                <div className="menu-items-section">
                    <div className="section-header">
                        <h2>Menu Items for {selectedRestaurant.name}</h2>
                        <button 
                            onClick={() => {
                                setShowMenuItemForm(true);
                                setEditMode(false);
                                setMenuItemForm({ name: '', description: '', price: '', imageUrl: '' });
                            }} 
                            className="btn btn-primary"
                        >
                            Add Menu Item
                        </button>
                    </div>

                    {showMenuItemForm && (
                        <div className="form-container">
                            <h3>{editMode ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                            <form onSubmit={handleMenuItemSubmit}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={menuItemForm.name} 
                                        onChange={handleMenuItemFormChange} 
                                        className="form-control" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        name="description" 
                                        value={menuItemForm.description} 
                                        onChange={handleMenuItemFormChange} 
                                        className="form-control" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={menuItemForm.price} 
                                        onChange={handleMenuItemFormChange} 
                                        className="form-control" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input 
                                        type="text" 
                                        name="imageUrl" 
                                        value={menuItemForm.imageUrl} 
                                        onChange={handleMenuItemFormChange} 
                                        className="form-control" 
                                    />
                                </div>
                                <div className="form-buttons">
                                    <button type="submit" className="btn btn-success">Save</button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowMenuItemForm(false)} 
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {isLoading ? (
                        <p>Loading menu items...</p>
                    ) : (
                        <div className="menu-items-list">
                            {menuItems.length === 0 ? (
                                <p>No menu items found for this restaurant.</p>
                            ) : (
                                <div className="row">
                                    {menuItems.map(menuItem => (
                                        <div key={menuItem._id} className="col-md-4 mb-4">
                                            <div className="card">
                                                {menuItem.imageUrl && (
                                                    <img 
                                                        src={menuItem.imageUrl} 
                                                        className="card-img-top" 
                                                        alt={menuItem.name} 
                                                    />
                                                )}
                                                <div className="card-body">
                                                    <h5 className="card-title">{menuItem.name}</h5>
                                                    <p className="card-text">{menuItem.description}</p>
                                                    <p className="card-text">Price: ${menuItem.price}</p>
                                                    <div className="card-actions">
                                                        <button 
                                                            onClick={() => handleEditMenuItem(menuItem)} 
                                                            className="btn btn-warning"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteMenuItem(menuItem._id)} 
                                                            className="btn btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;