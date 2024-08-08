import React from 'react';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const SubmitButton = ({
  submitting,
  handleClick,
  children,
  focusOnMount,
}: {
  submitting: boolean;
  handleClick: () => void;
  children: React.ReactNode;
  focusOnMount?: boolean;
}) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (focusOnMount) {
      ref.current?.focus();
    }
  }, [focusOnMount]);
  return (
    <Button
      ref={ref}
      variant="contained"
      color="primary"
      onClick={handleClick}
      disabled={submitting}
      type="submit"
      startIcon={submitting ? <CircularProgress size="1rem" /> : null}
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
