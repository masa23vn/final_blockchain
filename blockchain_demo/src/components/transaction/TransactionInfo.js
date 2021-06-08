import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Button,
  Card,
  CardHeader,
  TextField,
  InputAdornment,
  SvgIcon,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from '@material-ui/core';
import { LINK } from '../../constant/constant'
import axios from 'axios';

const transactionsEx = [
  {
    id: uuid(),
    ref: 'CDD1049',
    amount: 30.5,
    customer: {
      name: 'Ekaterina Tankova'
    },
    createdAt: 1555016400000,
    status: 'pending'
  },
];

const rowHeight = 53;

const TransactionInfo = (props) => {
  const [transaction, setTransaction] = useState();
  const ID = useParams().id;

  useEffect(async () => {
    await axios.get(`${LINK.API}/transaction/${ID}`)
      .then(function (res) {
        setTransaction(res.data)
      })
      .catch(function (err) {
        console.log(err);
      })

  }, [])

  const style = {
    width: "700px",
    wordWrap: "break-word",
  }
  return (
    <Card {...props}>
      <CardHeader title={`Transaction ${transaction?.id || "not found"}`} />
      <Divider />
      <PerfectScrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableBody>
              {transaction &&
                <>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Id: </TableCell>
                    <TableCell> {transaction.id} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Address: </TableCell>
                    <TableCell>
                      From:
                      <div style={style}>
                        {transaction?.sender}</div>
                      To:
                      <div style={style}>
                        {transaction?.receiver}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Amount: </TableCell>
                    <TableCell> {transaction.amount} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Status:</TableCell>
                    <TableCell> Success </TableCell>
                  </TableRow>
                </>
              }
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
    </Card>
  )
};

export default TransactionInfo;
