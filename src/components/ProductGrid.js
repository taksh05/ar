import React from 'react';
import products from '../data/products.json';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

const ProductGrid = () => {
  return (
    <div className="app-container grid-page">
      {/* Top Navigation & Title */}
      <header className="grid-header-section">
        <Link to="/" className="back-link">
          <span className="icon">‹</span> BACK TO TERMINAL
        </Link>
        <div className="title-wrapper">
          <h2 className="grid-title">AVAILABLE FLEET</h2>
          <div className="pulse-indicator">
            <span className="pulse-dot"></span>
            LIVE DATABASE
          </div>
        </div>
      </header>

      {/* Main Grid Container */}
      <main className="grid-content">
        <div className="products-layout">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </main>

      {/* Background Decoration (Optional for CSS later) */}
      <div className="grid-overlay-decor"></div>
    </div>
  );
};

export default ProductGrid;