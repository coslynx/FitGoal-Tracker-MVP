import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@material-ui/core';

interface ButtonProps extends MuiButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, isLoading, ...otherProps }) => {
  const handleClick = () => {
    try {
      if (onClick) {
        onClick();
      }
    } catch (error) {
      console.error('Error in Button onClick handler:', error);
    }
  };

  return isLoading ? (
    <CircularProgress size={24} />
  ) : (
    <MuiButton {...otherProps} onClick={handleClick}>
      {children}
    </MuiButton>
  );
};

const MemoizedButton = React.memo(Button);

export default MemoizedButton;

```