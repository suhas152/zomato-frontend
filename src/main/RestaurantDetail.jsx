import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        // Fetch restaurant details
        const restaurantRes = await axios.get(`http://localhost:5000/restaurants/${id}`);
        setRestaurant(restaurantRes.data);
        
        // Fetch menu items for this restaurant
        const menuRes = await axios.get(`http://localhost:5000/restaurants/${id}/menuitems`);
        setMenuItems(menuRes.data);
        
        // Fetch reviews for this restaurant
        const reviewsRes = await axios.get(`http://localhost:5000/reviews/restaurant/${id}`);
        setReviews(reviewsRes.data);
        
        // Get cart count if user is logged in
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const cartRes = await axios.get(`http://localhost:5000/cart/${userId}`);
            if (cartRes.data && cartRes.data.items) {
              const itemCount = cartRes.data.items.reduce((sum, item) => sum + item.quantity, 0);
              setCartCount(itemCount);
            }
          } catch (error) {
            console.error('Error fetching cart:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [id, reviewSubmitted]);

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
        setCartMessage('Please login to submit a review');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      await axios.post('http://localhost:5000/reviews', {
        user: userId,
        restaurant: id,
        rating: newReview.rating,
        comment: newReview.comment
      });

      setNewReview({ rating: 5, comment: '' });
      setReviewSubmitted(!reviewSubmitted); // Toggle to trigger useEffect
      setCartMessage('Review submitted successfully!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setCartMessage('Failed to submit review');
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setCartMessage('Please login to delete a review');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      await axios.delete(`http://localhost:5000/reviews/${reviewId}`);
      setReviewSubmitted(!reviewSubmitted); // Toggle to trigger useEffect and refresh reviews
      setCartMessage('Review deleted successfully!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      setCartMessage('Failed to delete review');
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  if (loading) return <div className="container mt-5 text-center">Loading...</div>;
  if (!restaurant) return <div className="container mt-5 text-center">Restaurant not found</div>;

  const addToCart = async (menuItem) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setCartMessage('Please login to add items to cart');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await axios.post(`http://localhost:5000/cart/${userId}/add`, {
        menuItem: menuItem._id,
        quantity: 1,
        price: menuItem.price
      });

      // Update cart count from response
      if (response.data && response.data.items) {
        const newCount = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(newCount);
        
        // Calculate total amount
        const totalAmount = response.data.items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 
          0
        ).toFixed(2);
        
        setCartMessage(`Item added to cart successfully! Cart total: $${totalAmount}`);
      } else {
        setCartMessage('Item added to cart successfully!');
      }
      
      setTimeout(() => setCartMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage('Failed to add item to cart');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
    : 'No ratings yet';

  return (
    <div className="container mt-5">
      {cartMessage && (
        <div className={`alert ${cartMessage.includes('success') || cartMessage.includes('total') ? 'alert-success' : 'alert-danger'} mb-3`}>
          {cartMessage}
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{restaurant.name}</h1>
        <div>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/cart')}
          >
            View Cart {cartCount > 0 && <span className="badge bg-primary">{cartCount}</span>}
          </button>
        </div>
      </div>
      
      <div className="row">
        <div className="col-12">
          <img
            src={restaurant.imageUrl || 'https://via.placeholder.com/1200x300?text=Restaurant'}
            alt={restaurant.name}
            className="img-fluid w-100 mb-4"
            style={{ height: '300px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/1200x300?text=Restaurant';
            }}
          />
        </div>
        <div className="col-12">
          <p className="lead">{restaurant.address}</p>
          {restaurant.cuisine && (
            <p>
              <strong>Cuisine:</strong> {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
            </p>
          )}
          <p>
            <strong>Rating:</strong> <span className="text-warning">{renderStars(averageRating !== 'No ratings yet' ? averageRating : 0)}</span>
            <span className="ms-2">{averageRating}</span>
            <span className="ms-2 text-muted">({reviews.length} reviews)</span>
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h3>Reviews</h3>
          <hr />
          
          {/* Review Form */}
          <div className="card mb-4">
            <div className="card-body">
              <h4>Write a Review</h4>
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
          
          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h5 className="card-title">{review.user?.name || 'Anonymous'}</h5>
                      <div>
                        <span className="text-muted me-3">{new Date(review.createdAt).toLocaleDateString()}</span>
                        {review.user?._id === localStorage.getItem('userId') && (
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => deleteReview(review._id)}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mb-2 text-warning">
                      {renderStars(review.rating)}
                    </div>
                    <p className="card-text">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <h2>Menu Items</h2>
          <div className="row">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item._id} className="col-md-4 mb-4">
                  <div className="card h-100">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">{item.description}</p>
                      <p className="card-text">
                        <strong>Price:</strong> ${item.price}
                      </p>
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-primary"
                          onClick={() => addToCart(item)}
                        >
                          Add to Cart
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => navigate(`/explore-item/${item._id}`)}
                        >
                          <i className="bi bi-search"></i> Explore Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p>No menu items available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}