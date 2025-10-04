import React, { useState, useEffect } from 'react';
import './Products.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Products() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'name',
    search: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories for filter dropdown
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch menu items based on current filters
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.sort) queryParams.append('sort', filters.sort);
        if (filters.search) queryParams.append('search', filters.search);
        
        const response = await axios.get(`http://localhost:5000/explore?${queryParams.toString()}`);
        setMenuItems(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [filters]);

  const handleViewDetails = (productId) => {
    if (selectedProduct === productId) {
      setSelectedProduct(null); // Close if already open
    } else {
      setSelectedProduct(productId); // Open new product details
    }
  };

  const handleExplore = (productId) => {
    navigate(`/explore-item/${productId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The useEffect will handle the actual filtering
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    if (!rating) return "☆☆☆☆☆";
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Explore Our Menu</h2>
      
      {/* Search and Filter Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <form onSubmit={handleSearchSubmit}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search for dishes..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </form>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select" 
            name="category" 
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="all">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select" 
            name="sort" 
            value={filters.sort}
            onChange={handleFilterChange}
          >
            <option value="name">Sort by Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Highest Rated</option>
          </select>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className='product-container row g-4'>
          {menuItems.length > 0 ? (
            menuItems.map(item => (
              <div key={item._id} className='product col-md-4 col-lg-3'>
                <div className="card h-100">
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Food+Item'}
                    className="card-img-top"
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Food+Item';
                    }}
                  />
                  <div className="card-body">
                    <h3 className="card-title">{item.name}</h3>
                    <div className="rating mb-2">
                      <span className="text-warning">{renderStars(item.averageRating)}</span>
                      <span className="ms-2">{item.averageRating || 'No ratings'}</span>
                    </div>
                    <p className="card-text">{item.description}</p>
                    <p className="price">${item.price?.toFixed(2)}</p>
                    <div className="d-grid gap-2">
                      <button 
                        className='btn btn-primary'
                        onClick={() => handleViewDetails(item._id)}
                      >
                        {selectedProduct === item._id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button 
                        className='btn btn-outline-primary'
                        onClick={() => handleExplore(item._id)}
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                  
                  {selectedProduct === item._id && (
                    <div className="card-footer additional-details">
                      <p><strong>Restaurant:</strong> {item.restaurant?.name || 'Unknown'}</p>
                      <p><strong>Category:</strong> {item.category || 'Uncategorized'}</p>
                      {item.preparationTime && (
                        <p><strong>Preparation Time:</strong> {item.preparationTime}</p>
                      )}
                      {item.calories && (
                        <p><strong>Calories:</strong> {item.calories}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No menu items found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
