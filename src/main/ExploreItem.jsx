import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExploreItem.css';

export default function ExploreItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [showZoomedImage, setShowZoomedImage] = useState(false);

  // At the beginning of the component
  console.log('ExploreItem component rendering with ID:', id);
  
  // In the useEffect
  useEffect(() => {
    const fetchItemAndReviews = async () => {
      try {
        console.log(`Attempting to fetch menu item with ID: ${id}`);
        // Try different endpoint formats
        let itemRes;
        try {
          itemRes = await axios.get(`http://localhost:5000/menuitems/${id}`);
        } catch (err) {
          console.log('First endpoint failed, trying alternative...');
          itemRes = await axios.get(`http://localhost:5000/menu-items/${id}`);
        }
        
        console.log('Menu item data received:', itemRes.data);
        setItem(itemRes.data);
        
        console.log(`Attempting to fetch reviews for menu item ID: ${id}`);
        // Try different review endpoint formats
        let reviewsRes;
        try {
          reviewsRes = await axios.get(`http://localhost:5000/reviews/menuitem/${id}`);
        } catch (err) {
          console.log('First review endpoint failed, trying alternative...');
          try {
            reviewsRes = await axios.get(`http://localhost:5000/reviews/menu-item/${id}`);
          } catch (err2) {
            console.log('Second review endpoint failed, trying restaurant reviews...');
            if (itemRes.data && itemRes.data.restaurant && itemRes.data.restaurant._id) {
              reviewsRes = await axios.get(`http://localhost:5000/reviews/restaurant/${itemRes.data.restaurant._id}`);
            } else {
              reviewsRes = { data: [] };
            }
          }
        }
        
        console.log('Reviews data received:', reviewsRes.data);
        setReviews(reviewsRes.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching item details:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          setError(`Failed to load item details: ${error.response.data.error || error.response.statusText}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          setError('Failed to load item details: No response from server');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          setError(`Failed to load item details: ${error.message}`);
        }
        setLoading(false);
      }
    };
  
    if (id) {
      console.log(`ExploreItem component mounted with ID: ${id}`);
      fetchItemAndReviews();
    } else {
      console.error('Item ID is missing in URL parameters');
      setError('Item ID is missing');
      setLoading(false);
    }
  }, [id]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setReviewMessage('Please login to submit a review');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      await axios.post('http://localhost:5000/reviews/menu-item', {
        user: userId,
        menuItem: id,
        rating: newReview.rating,
        comment: newReview.comment
      });

      // Refresh reviews
      const reviewsRes = await axios.get(`http://localhost:5000/reviews/menu-item/${id}`);
      setReviews(reviewsRes.data || []);
      
      setNewReview({ rating: 5, comment: '' });
      setReviewMessage('Review submitted successfully!');
      setTimeout(() => setReviewMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewMessage('Failed to submit review');
      setTimeout(() => setReviewMessage(''), 3000);
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  const addToCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Please login to add items to cart');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      await axios.post(`http://localhost:5000/cart/${userId}/add`, {
        menuItem: item._id,
        quantity: 1,
        price: item.price
      });

      setError('');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
    }
  };

  const toggleZoom = () => {
    setShowZoomedImage(!showZoomedImage);
  };

  if (loading) return <div className="container mt-5 text-center">Loading...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
  if (!item) return <div className="container mt-5 text-center">Item not found</div>;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
    : 'No ratings yet';

  return (
    <div className="explore-item-container">
      {/* Hero Section with Item Image */}
      <div 
        className="hero-section" 
        style={{ backgroundImage: `url(${item.imageUrl || 'https://via.placeholder.com/1200x600?text=No+Image'})` }}
        onClick={toggleZoom}
      >
        <div className="hero-overlay">
          <div className="container">
            <h1 className="hero-title">{item.name}</h1>
            <div className="hero-rating">
              <span className="text-warning">{renderStars(averageRating !== 'No ratings yet' ? averageRating : 0)}</span>
              <span className="ms-2">{averageRating}</span>
              <span className="ms-2">({reviews.length} reviews)</span>
            </div>
            <div className="zoom-hint">
              <i className="bi bi-zoom-in"></i> Click to zoom
            </div>
          </div>
        </div>
      </div>

      {/* Zoomed Image Modal */}
      {showZoomedImage && (
        <div className="zoomed-image-overlay" onClick={toggleZoom}>
          <div className="zoomed-image-container">
            <img 
              src={item.imageUrl || 'https://via.placeholder.com/1200x600?text=No+Image'} 
              alt={item.name} 
              className="zoomed-image"
            />
            <button className="close-zoom-btn" onClick={toggleZoom}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="explore-nav">
        <div className="container">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviews.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'nutrition' ? 'active' : ''}`}
                onClick={() => setActiveTab('nutrition')}
              >
                Nutrition Info
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mt-4">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="row">
            <div className="col-md-8">
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title">About this Item</h3>
                  <p className="card-text lead">{item.description}</p>
                  
                  <div className="item-details mt-4">
                    <div className="row">
                      <div className="col-md-6">
                        <h5>Price</h5>
                        <p className="price-tag">₹{item.price?.toFixed(2)}</p>
                      </div>
                      {item.preparationTime && (
                        <div className="col-md-6">
                          <h5>Preparation Time</h5>
                          <p>{item.preparationTime}</p>
                        </div>
                      )}
                    </div>
                    
                    {item.restaurant && (
                      <div className="mt-3">
                        <h5>Restaurant</h5>
                        <p>{item.restaurant.name}</p>
                        {item.restaurant.address && (
                          <p className="text-muted small">{item.restaurant.address}</p>
                        )}
                      </div>
                    )}
                    
                    {item.ingredients && (
                      <div className="mt-3">
                        <h5>Ingredients</h5>
                        <p>{Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Order Now</h4>
                  <p className="price-tag mb-3">${item.price?.toFixed(2)}</p>
                  <button 
                    className="btn btn-primary btn-lg w-100 mb-3"
                    onClick={addToCart}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="card">
            <div className="card-body">
              <h3 className="card-title mb-4">Customer Reviews</h3>
              
              {/* Review Form */}
              <div className="card mb-4">
                <div className="card-body">
                  <h4>Write a Review</h4>
                  {reviewMessage && (
                    <div className={`alert ${reviewMessage.includes('success') ? 'alert-success' : 'alert-danger'} mb-3`}>
                      {reviewMessage}
                    </div>
                  )}
                  <form onSubmit={submitReview}>
                    <div className="mb-3">
                      <label htmlFor="rating" className="form-label">Rating</label>
                      <select 
                        className="form-select" 
                        id="rating" 
                        name="rating"
                        value={newReview.rating}
                        onChange={handleReviewChange}
                        required
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="comment" className="form-label">Comment</label>
                      <textarea 
                        className="form-control" 
                        id="comment" 
                        name="comment"
                        rows="3"
                        value={newReview.comment}
                        onChange={handleReviewChange}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                  </form>
                </div>
              </div>
              
              {/* Reviews Summary */}
              <div className="reviews-summary mb-4">
                <div className="row align-items-center">
                  <div className="col-md-3 text-center">
                    <div className="average-rating">{averageRating !== 'No ratings yet' ? averageRating : '0'}</div>
                    <div className="text-warning h3">{renderStars(averageRating !== 'No ratings yet' ? averageRating : 0)}</div>
                    <p className="text-muted">Based on {reviews.length} reviews</p>
                  </div>
                  <div className="col-md-9">
                    {/* Rating distribution would go here */}
                  </div>
                </div>
              </div>
              
              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="d-flex justify-content-between">
                        <h5>{review.user?.name || 'Anonymous'}</h5>
                        <div className="text-warning">{renderStars(review.rating)}</div>
                      </div>
                      <h6 className="text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </h6>
                      <p>{review.comment}</p>
                      <hr />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">No reviews yet for this item.</div>
              )}
            </div>
          </div>
        )}
        
        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div className="card">
            <div className="card-body">
              <h3 className="card-title mb-4">Nutrition Information</h3>
              
              {item.calories || item.nutritionInfo ? (
                <div className="nutrition-info">
                  <div className="row">
                    <div className="col-md-6">
                      <table className="table">
                        <tbody>
                          {item.calories && (
                            <tr>
                              <th>Calories</th>
                              <td>{item.calories}</td>
                            </tr>
                          )}
                          {item.servingSize && (
                            <tr>
                              <th>Serving Size</th>
                              <td>{item.servingSize}</td>
                            </tr>
                          )}
                          {item.nutritionInfo?.protein && (
                            <tr>
                              <th>Protein</th>
                              <td>{item.nutritionInfo.protein}g</td>
                            </tr>
                          )}
                          {item.nutritionInfo?.carbs && (
                            <tr>
                              <th>Carbohydrates</th>
                              <td>{item.nutritionInfo.carbs}g</td>
                            </tr>
                          )}
                          {item.nutritionInfo?.fat && (
                            <tr>
                              <th>Fat</th>
                              <td>{item.nutritionInfo.fat}g</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-info">
                  Nutrition information is not available for this item.
                </div>
              )}
              
              {item.allergens && (
                <div className="allergens mt-4">
                  <h4>Allergens</h4>
                  <p>{Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}