import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ children, variant = 'primary', to, onClick, className = '', type = 'button', form }) => {
  const baseStyle = "inline-flex items-center justify-center px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 font-body";

  const variants = {
    primary: "bg-[#FFBD59] text-[#000000] border-none hover:brightness-95",
    secondary: "bg-transparent text-[#000000] border border-[#000000] hover:bg-[#FEFBF1] hover:border-[#FFBD59]",
    ghost: "bg-transparent text-[#000000] border border-[#000000] hover:bg-[#FEFBF1] hover:border-[#FFBD59]",
    gold: "bg-[#FFBD59] text-[#000000] border-none hover:brightness-95",
    dark: "bg-[#000000] text-[#FFFFFF] border-none hover:bg-neutral-900"
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
