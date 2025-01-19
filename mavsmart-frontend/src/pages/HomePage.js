// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import ItemCard from '../components/itemCard';

const HomePage = () => {
  const [items, setItems] = useState([]);

  // Dummy data for now
  useEffect(() => {
    setItems([
      { id: 1, name: 'Laptop', description: 'Used MacBook Pro', price: 450, image: 'https://via.placeholder.com/150' },
      { id: 2, name: 'Textbook', description: 'Intro to Programming', price: 30, image: 'https://via.placeholder.com/150' },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Items for Sale</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
