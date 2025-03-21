import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  styled 
} from '@mui/material';

const ViewerContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

interface TableViewerProps {
  data: any[] | Record<string, any>;
  title?: string;
}

const TableViewer: React.FC<TableViewerProps> = ({ data, title }) => {
  // Convert the data to an array if it's an object
  const tableData = Array.isArray(data) ? data : [data];
  
  // Extract all possible headers from the data
  const headers = React.useMemo(() => {
    const allKeys = new Set<string>();
    
    tableData.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });
    
    return Array.from(allKeys);
  }, [tableData]);

  // Handle simple types that aren't objects
  if (tableData.length === 0 || !headers.length) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {title && (
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>
        )}
        <ViewerContainer>
          <Box p={2}>
            <Typography variant="body2" color="textSecondary">
              No tabular data available.
            </Typography>
          </Box>
        </ViewerContainer>
      </Box>
    );
  }

  // Format cell values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
      )}
      
      <ViewerContainer>
        <TableContainer sx={{ maxHeight: '100%' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headers.map(header => (
                  <TableCell key={header}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map(header => (
                    <TableCell key={`${rowIndex}-${header}`}>
                      {formatValue(row[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ViewerContainer>
    </Box>
  );
};

export default TableViewer; 