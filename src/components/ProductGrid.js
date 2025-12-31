import React from 'react';
import products from '../data/products.json';
import ProductCard from './ProductCard';

const ProductGrid = () => {
  return (
    <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, width: '100%', maxWidth: 1200 }}>
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
