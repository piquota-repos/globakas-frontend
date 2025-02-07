import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">{children}</div>
);

export const CardContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

export const CardHeader = ({ children }) => (
  <div className="bg-gray-100 p-4">{children}</div>
);

export const CardTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-800">{children}</h3>
);
