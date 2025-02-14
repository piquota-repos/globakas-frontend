import React from 'react';
import '../styles/button.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  fullWidth = false,
  onClick,
  disabled = false,
  className = '',
  icon
}) => {
  const buttonClasses = `custom-button ${variant} ${fullWidth ? 'full-width' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;