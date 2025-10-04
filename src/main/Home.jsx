import React from 'react';
import { Carousel } from 'react-bootstrap';
import './HomeCarousel.css';
import Restaurent from './Restaurent';

const HomeCarousel = () => {
  return (
    <div className="home-container">
      {/* Logo/Header */}
      <header className="text-center py-4" style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
        <h1 style={{ fontWeight: "bold", color: "#2d8659", letterSpacing: "2px" }}>ZOMA</h1>
      </header>
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=3840"
            alt="Gourmet Food Plating"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=3840"
            alt="Luxury Restaurant Interior"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=3840"
            alt="Vibrant Food Spread"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=3840"
            alt="Fine Dining Experience"
          />
        </Carousel.Item>
      </Carousel>

      <div className="nutrition-section container mt-5 mb-5">
        <h2 className="text-center mb-4"><u>We Serve Nutrition With Care</u></h2>
        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                className="card-img-top"
                alt="High Protein Foods"
                style={{ height: "220px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">Proteins</h5>
                <p className="card-text">Our menu is rich in high-quality proteins, essential for muscle growth and repair. Enjoy dishes with lean meats, legumes, and more.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
                className="card-img-top"
                alt="Vitamins Variety"
                style={{ height: "220px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">Vitamins</h5>
                <p className="card-text">Fresh fruits and vegetables in our dishes provide a spectrum of vitamins to boost your immunity and overall health.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <img
                src="https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=80"
                className="card-img-top"
                alt="Balanced Nutrition"
                style={{ height: "220px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">Balanced Nutrition</h5>
                <p className="card-text">We care for your nutritional needs by offering balanced meals with the right mix of carbs, proteins, fats, and micronutrients.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="text-center py-4 mt-5" style={{ background: "#2d8659", color: "#fff" }}>
        <div className="container">
          <h5>About Food &amp; Health</h5>
          <p>
            At ZOMA, we believe that good food is the foundation of genuine happiness and health.
            Our menu is crafted to provide balanced nutrition, using fresh ingredients and mindful cooking methods.
            Eating well not only fuels your body but also supports mental well-being and longevity.
            Remember, a healthy outside starts from the inside!
          </p>
          <small>&copy; {new Date().getFullYear()} ZOMA. All rights reserved.</small>
        </div>
      </footer>
    </div>  
  );
}

export default HomeCarousel;
