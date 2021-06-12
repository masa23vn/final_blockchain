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
  Chip,
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
      <CardHeader title={`Transaction ${transaction?.supplyID || "not found"}`} />
      <Divider />
      <PerfectScrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableBody>
              {transaction &&
                <>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Supply ID: </TableCell>
                    <TableCell> {transaction.supplyID} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Start: </TableCell>
                    <TableCell>
                      {transaction?.fromLocation.name}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Destination: </TableCell>
                    <TableCell>
                      {transaction?.toLocation.name}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Status:</TableCell>
                    <TableCell> <Chip
                      color={transaction?.isFinish ? "primary" : "secondary"}
                      label={transaction?.isFinish ? "Finish" : "Not Finish"}
                      size="small"
                    />
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Number of Items: </TableCell>
                    <TableCell> {transaction?.amount} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Item's name: </TableCell>
                    <TableCell> {transaction?.name} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Item's Description: </TableCell>
                    <TableCell> {transaction?.description} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Item's price: </TableCell>
                    <TableCell> {transaction?.price} </TableCell>
                  </TableRow>

                </>
              }
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
    </Card >
  )
};

export default TransactionInfo;
