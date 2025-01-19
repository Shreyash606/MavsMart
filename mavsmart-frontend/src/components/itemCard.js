// src/components/ItemCard.js
import React from 'react';

const ItemCard = ({ item }) => {
  return (
    <div className="border border-gray-300 rounded-md p-4">
      <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-md"/>
      <h3 className="mt-2 font-semibold">{item.name}</h3>
      <p>{item.description}</p>
      <p className="font-bold text-blue-600">{`$${item.price}`}</p>
    </div>
  );
};

export default ItemCard;
