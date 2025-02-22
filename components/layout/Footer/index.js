import { Box } from '@mui/material';
import FeedbackFab from './FeedbackFab';

/**
 * A component with a footer.
 */
export default function Footer({ children }) {
  return (
    <Box className="footer">
      <div className="inner">
        {children}
        <FeedbackFab />
      </div>
    </Box>
  );
}
