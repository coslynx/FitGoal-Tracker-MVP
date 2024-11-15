import React from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';

interface InputProps extends TextFieldProps {
  type?: 'text' | 'email' | 'password' | 'number';
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string | number;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ type = 'text', label, placeholder, onChange, value, error = false, helperText, required = false, ...otherProps }) => {
  return (
    <TextField
      type={type}
      label={label}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      error={error}
      helperText={helperText}
      required={required}
      {...otherProps}
    />
  );
};

export default Input;

```