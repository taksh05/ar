import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card" style={{ width: 320, background: '#0b0b0b', borderRadius: 8, overflow: 'hidden', color: '#fff' }}>
      <div style={{ height: 180, background: `url(${product.image}) center/cover no-repeat` }} />
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>{product.title}</h3>
        <div style={{ marginBottom: 12 }}>{product.price}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline">View</button>
          </Link>
          <Link to={`/ar`} style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary">Open AR</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
