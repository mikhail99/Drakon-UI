import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  styled 
} from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const ViewerContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: theme.spacing(2),
  overflowY: 'auto',
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

interface TextJsonViewerProps {
  data: unknown;
  title?: string;
}

const TextJsonViewer: React.FC<TextJsonViewerProps> = ({ data, title }) => {
  // Convert data to string if it's not already a string
  const displayData = typeof data === 'string' 
    ? data 
    : JSON.stringify(data, null, 2);

  // Determine if data is JSON
  const isJson = typeof data !== 'string' || 
    (typeof data === 'string' && (data.trim().startsWith('{') || data.trim().startsWith('[')));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
      )}
      
      <ViewerContainer>
        {isJson ? (
          <SyntaxHighlighter 
            language="json" 
            style={docco} 
            customStyle={{ margin: 0, backgroundColor: 'transparent' }}
          >
            {displayData}
          </SyntaxHighlighter>
        ) : (
          <Typography 
            component="pre" 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              m: 0 
            }}
          >
            {displayData}
          </Typography>
        )}
      </ViewerContainer>
    </Box>
  );
};

export default TextJsonViewer; 