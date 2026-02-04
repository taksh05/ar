import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card glass-card">
      {/* Product Image with Gradient Overlay */}
      <div className="product-image-container">
        <div 
          className="product-image" 
          style={{ backgroundImage: `url(${product.image})` }} 
        />
        <div className="image-overlay"></div>
        <div className="category-tag">DRONE TECH</div>
      </div>

      {/* Product Details */}
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-price">
          <span className="currency">$</span>{product.price}
        </div>
        
        <p className="product-desc">High-altitude cargo delivery system v1.0</p>

        <div className="card-actions">
          <Link to={`/product/${product.slug}`} className="btn-link">
            <button className="btn btn-outline btn-sm">SPECS</button>
          </Link>
          <Link to={`/ar`} className="btn-link">
            <button className="btn btn-primary btn-sm">LAUNCH AR</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;