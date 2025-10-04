import React, { useState } from 'react';
import { Link, BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Register from './Register';
import Restaurents from './Restaurents';
import Profile from './Profile';
import Products from './Products';
import Home from './Home';
import Login from './Login';
import RestaurantDetail from './RestaurantDetail';
import Cart from './Cart';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import ExploreItem from './ExploreItem';
import Logout from './Logout';
import Orders from './Orders';

export default function MainNavbar() {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <BrowserRouter> 
      <div>
        <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
          <div className='container-fluid'>
            <Link className='navbar-brand' to="/">ZOMA</Link>
            <button 
              className='navbar-toggler'
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse' id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/restaurents">
                    Restaurents
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                {/* Removing the Explore navigation item */}
                <li className="nav-item">
                  <Link className="nav-link" to="/products">
                    Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    onClick={toggleDropdown}
                    aria-expanded={showDropdown}
                  >
                    Login
                  </a>
                  <ul className={`dropdown-menu${showDropdown ? ' show' : ''}`}>
                    <li>
                      <Link className="dropdown-item" to="/login">
                        User Login
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/admin/login">
                        Admin Login
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    Cart
                  </Link>
                </li>
                <li className="nav-item">
                <Link to="/logout" className="nav-link">Logout</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      
      <Routes>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/restaurents' element={<Restaurents/>}></Route>
        <Route path='/restaurant/:id' element={<RestaurantDetail/>}></Route>
        <Route path='/profile' element={<Profile/>}></Route>
        <Route path='/products' element={<Products/>}></Route>
        <Route path="/orders" element={<Orders/>} />
        <Route path="/logout" element={<Logout/>} />
        <Route path='/' element={<Home/>}></Route>
        <Route path='/cart' element={<Cart/>}></Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path='/explore-item/:id' element={<ExploreItem />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
