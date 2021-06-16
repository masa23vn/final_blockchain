import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Container,
  Card,
  CardHeader,
  TextField,
  InputAdornment,
  SvgIcon,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from '@material-ui/core';
import { Search as SearchIcon } from 'react-feather';

const WalletsList = (props) => {
  const [supplies, setSupplies] = useState([]);
  const { data, setSelected } = props;

  useEffect(() => {
    if (data) {
      data.reverse()
    }
    setSupplies(data || [])
  }, [data]);

  return (
    <Card style={{ height: '100%' }}>
      <CardHeader title={
        <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography><b>Latest Supply ({supplies?.length})</b></Typography>
        </Box>
      } />
      <Divider />
      <Box style={{ width: '100%', height: '100%' }}>
        {(supplies || []).map((i, n) => {
          return (
            <div key={n} >
              <div style={{ minHeight: '50px', padding: '12px 20px 10px 20px' }} onClick={e => setSelected(i)}>
                {i.data[0]?.supplyID}
              </div>
              <Divider />
            </div>
          );
        })}
      </Box>
    </Card>
  )
};

export default WalletsList;
