 import React from 'react';

export const Avatar = ({ children }) => (
  <div className="inline-block rounded-full overflow-hidden">{children}</div>
);

export const AvatarImage = ({ src, alt }) => (
  <img className="h-8 w-8 object-cover" src={src} alt={alt} />
);

export const AvatarFallback = ({ children }) => (
  <span className="h-8 w-8 flex items-center justify-center bg-gray-200 text-gray-700">{children}</span>
);
