import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    deliveryAddress: '',
    paymentMethod: 'razorpay', // Default to Razorpay
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    nameOnCard: ''
  });
  const [orderStatus, setOrderStatus] = useState({ message: '', type: '' });
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/cart/${userId}`);
        setCart(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setLoading(false);
      }
    };

    fetchCart();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const updateQuantity = async (menuItemId, newQuantity) => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.put(`http://localhost:5000/cart/${userId}/update`, {
        menuItemId,
        quantity: newQuantity
      });

      // Refresh cart
      const response = await axios.get(`http://localhost:5000/cart/${userId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.delete(`http://localhost:5000/cart/${userId}/remove/${menuItemId}`);

      // Refresh cart
      const response = await axios.get(`http://localhost:5000/cart/${userId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData({
      ...checkoutData,
      [name]: value
    });
  };

  const proceedToCheckout = () => {
    setShowCheckout(true);
  };

  const initiateRazorpayPayment = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setOrderStatus({
          message: 'Please login to place an order',
          type: 'error'
        });
        return false;
      }
      
      // Create Razorpay order
      const orderResponse = await axios.post('http://localhost:5000/create-razorpay-order', {
        amount: cart.total + 2.99, // Total + delivery fee
        receipt: `order_${Date.now()}`
      });
      
      const options = {
        key: 'rzp_test_q37h619q7PNVMd',
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Food Delivery App',
        description: 'Food Order Payment',
        order_id: orderResponse.data.id,
        handler: async function(response) {
          // Get restaurant ID from first item
          const restaurantId = cart.items[0]?.menuItem.restaurant;
          
          // Format items for order
          const orderItems = cart.items.map(item => ({
            menuItem: item.menuItem._id,
            quantity: item.quantity
          }));
          
          // Verify payment and create order
          const verifyResponse = await axios.post('http://localhost:5000/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId,
            restaurantId,
            items: orderItems,
            totalAmount: cart.total + 2.99,
            deliveryAddress: checkoutData.deliveryAddress
          });
          
          if (verifyResponse.data.success) {
            setOrderStatus({
              message: 'Payment successful! Order placed.',
              type: 'success'
            });
            
            // Reset checkout form
            setCheckoutData({
              deliveryAddress: '',
              paymentMethod: 'razorpay',
              cardNumber: '',
              cardExpiry: '',
              cardCvv: '',
              nameOnCard: ''
            });
            
            // Redirect to order confirmation after a delay
            setTimeout(() => {
              localStorage.setItem('orderSuccessMessage', 'Order placed successfully!');
              navigate('/orders', { state: { successMessage: 'Order placed successfully!' } });
            }, 2000);
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };
      
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
      return true;
    } catch (error) {
      console.error('Razorpay payment error:', error);
      setOrderStatus({
        message: error.response?.data?.message || 'Payment initialization failed',
        type: 'error'
      });
      return false;
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setOrderStatus({
          message: 'Please login to place an order',
          type: 'error'
        });
        setProcessingPayment(false);
        return;
      }

      if (checkoutData.paymentMethod === 'razorpay') {
        const razorpayInitiated = await initiateRazorpayPayment();
        if (razorpayInitiated) {
          setProcessingPayment(false);
          return;
        }
      } else {
        // Get restaurant ID from first item
        const restaurantId = cart.items[0]?.menuItem.restaurant;
        if (!restaurantId) {
          setOrderStatus({
            message: 'Restaurant information missing in cart.',
            type: 'error'
          });
          setProcessingPayment(false);
          return;
        }

        // Format items for order
        const orderItems = cart.items.map(item => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity
        }));

        // Validate required fields
        if (
          !userId ||
          !restaurantId ||
          !orderItems.length ||
          !checkoutData.deliveryAddress ||
          !checkoutData.paymentMethod
        ) {
          setOrderStatus({
            message: 'Please fill all required fields.',
            type: 'error'
          });
          setProcessingPayment(false);
          return;
        }

        // Prepare payment details
        const paymentDetails = checkoutData.paymentMethod === 'card' ? {
          cardNumber: checkoutData.cardNumber,
          cardExpiry: checkoutData.cardExpiry,
          cardCvv: checkoutData.cardCvv,
          nameOnCard: checkoutData.nameOnCard
        } : null;

        // Create order
        const response = await axios.post('http://localhost:5000/orders', {
          userId,
          restaurant: restaurantId, 
          items: orderItems,
          totalAmount: cart.total + 2.99,
          deliveryAddress: checkoutData.deliveryAddress,
          paymentMethod: checkoutData.paymentMethod,
          paymentDetails
        });

        if (response.data.success) {
          setOrderStatus({
            message: 'Order placed successfully!',
            type: 'success'
          });
          setCheckoutData({
            deliveryAddress: '',
            paymentMethod: 'razorpay',
            cardNumber: '',
            cardExpiry: '',
            cardCvv: '',
            nameOnCard: ''
          });
          setTimeout(() => {
            localStorage.setItem('orderSuccessMessage', 'Order placed successfully!');
            navigate('/orders', { state: { successMessage: 'Order placed successfully!' } });
          }, 2000);
        } else {
          setOrderStatus({
            message: response.data.message || 'Failed to place order',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus({
        message: error.response?.data?.message || 'Error placing order. Please try again.',
        type: 'error'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!cart) return <div className="container mt-5">Please login to view cart</div>;

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      
      {orderStatus.message && (
        <div className={`alert alert-${orderStatus.type === 'success' ? 'success' : 'danger'} mt-3`}>
          {orderStatus.message}
        </div>
      )}
      
      {cart?.items.length === 0 ? (
        <div className="text-center mt-4">
          <p>Your cart is empty</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/restaurents')}
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <>
          {!showCheckout ? (
            <>
              <div className="row">
                {cart?.items.map((item) => (
                  <div key={item._id} className="col-12 mb-3">
                    <div className="card">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          {item.menuItem.imageUrl && (
                            <img 
                              src={item.menuItem.imageUrl} 
                              alt={item.menuItem.name}
                              className="cart-item-image me-3"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <h5 className="card-title">{item.menuItem.name}</h5>
                            <p className="card-text mb-0">Price: ${item.price}</p>
                            <p className="card-text">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <button 
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button 
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <button 
                            className="btn btn-sm btn-danger ms-3"
                            onClick={() => removeItem(item.menuItem._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="card mt-4">
                <div className="card-body">
                  <h4>Order Summary</h4>
                  <div className="d-flex justify-content-between mt-3">
                    <span>Subtotal:</span>
                    <span>₹{cart?.total.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span>Delivery Fee:</span>
                    <span>₹2.99</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong>₹{(cart?.total + 2.99).toFixed(2)}</strong>
                  </div>
                  <button 
                    className="btn btn-primary w-100 mt-3"
                    onClick={proceedToCheckout}
                  >
                    Proceed to Checkout
                  </button>
                  <button 
                    className="btn btn-success w-100 mt-2"
                    onClick={initiateRazorpayPayment}
                  >
                    Pay Now with Razorpay
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-body">
                    <h4>Checkout</h4>
                    <form onSubmit={placeOrder}>
                      <div className="mb-3">
                        <label htmlFor="deliveryAddress" className="form-label">Delivery Address</label>
                        <textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          className="form-control"
                          value={checkoutData.deliveryAddress}
                          onChange={handleCheckoutChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Payment Method</label>
                        <div className="d-flex">
                          <div className="form-check me-4">
                            <input
                              type="radio"
                              id="razorpay"
                              name="paymentMethod"
                              value="razorpay"
                              className="form-check-input"
                              checked={checkoutData.paymentMethod === 'razorpay'}
                              onChange={handleCheckoutChange}
                            />
                            <label htmlFor="razorpay" className="form-check-label">Razorpay</label>
                          </div>
                          
                          <div className="form-check">
                            <input
                              type="radio"
                              id="cod"
                              name="paymentMethod"
                              value="cod"
                              className="form-check-input"
                              checked={checkoutData.paymentMethod === 'cod'}
                              onChange={handleCheckoutChange}
                            />
                            <label htmlFor="cod" className="form-check-label">Cash on Delivery</label>
                          </div>
                        </div>
                      </div>
                      
                      {checkoutData.paymentMethod === 'card' && (
                        <div className="card-payment-details">
                          <div className="mb-3">
                            <label htmlFor="nameOnCard" className="form-label">Name on Card</label>
                            <input
                              type="text"
                              id="nameOnCard"
                              name="nameOnCard"
                              className="form-control"
                              value={checkoutData.nameOnCard}
                              onChange={handleCheckoutChange}
                              required={checkoutData.paymentMethod === 'card'}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="cardNumber" className="form-label">Card Number</label>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              className="form-control"
                              value={checkoutData.cardNumber}
                              onChange={handleCheckoutChange}
                              placeholder="1234 5678 9012 3456"
                              required={checkoutData.paymentMethod === 'card'}
                            />
                          </div>
                          
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="cardExpiry" className="form-label">Expiry Date</label>
                              <input
                                type="text"
                                id="cardExpiry"
                                name="cardExpiry"
                                className="form-control"
                                value={checkoutData.cardExpiry}
                                onChange={handleCheckoutChange}
                                placeholder="MM/YY"
                                required={checkoutData.paymentMethod === 'card'}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="cardCvv" className="form-label">CVV</label>
                              <input
                                type="text"
                                id="cardCvv"
                                name="cardCvv"
                                className="form-control"
                                value={checkoutData.cardCvv}
                                onChange={handleCheckoutChange}
                                placeholder="123"
                                required={checkoutData.paymentMethod === 'card'}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between mt-4">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary"
                          onClick={() => setShowCheckout(false)}
                        >
                          Back to Cart
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-success"
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Processing...
                            </>
                          ) : (
                            'Place Order'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h4>Order Summary</h4>
                    <div className="mt-3">
                      {cart?.items.map((item) => (
                        <div key={item._id} className="d-flex justify-content-between mb-2">
                          <span>{item.menuItem.name} x {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mt-2">
                      <span>Subtotal:</span>
                      <span>${cart?.total.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span>Delivery Fee:</span>
                      <span>$2.99</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <strong>${(cart?.total + 2.99).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
