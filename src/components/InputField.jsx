import React from 'react';

const InputField = ({ label, type, name, value, onChange }) => {
  return (
    <div className="input-field">
      <label htmlFor={name}>{label}</label>
      <input 
        type={type} 
        id={name} 
        name={name} 
        value={value} 
        onChange={onChange} 
        required 
      />
    </div>
  );
};

export default InputField;
