import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ children, variant = 'primary', to, onClick, className = '', type = 'button', form }) => {
  const baseStyle = "inline-flex items-center justify-center px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 font-body";

  const variants = {
    primary: "bg-accent text-primary hover:bg-[#d4b584]",
    ghost: "bg-transparent border border-accent text-primary hover:bg-accent hover:text-primary",
    gold: "bg-[#d4b584] text-primary hover:bg-accent font-bold"
  };

  const combinedClass = `${baseStyle} ${variants[variant]} ${className}`;

  if (to) {
    return <Link to={to} className={combinedClass}>{children}</Link>;
  }

  return (
    <button type={type} onClick={onClick} className={combinedClass} form={form}>
      {children}
    </button>
  );
};

export default Button;
