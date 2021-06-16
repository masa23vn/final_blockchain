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

const suppliesEx = [
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

const SupplyInfo = (props) => {
  const [supply, setSupply] = useState();
  const [supplyList, setList] = useState([]);

  const ID = useParams().id;

  useEffect(async () => {
    await axios.get(`${LINK.API}/supply/${ID}`)
      .then(function (res) {
        setSupply(res?.data[0])
        setList(res.data.reverse())
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
      <CardHeader title={`Supply ${supply?.supplyID || "not found"}`} />
      <Divider />
      <PerfectScrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableBody>
              {supply &&
                <>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Item's ID: </TableCell>
                    <TableCell> {supply?.itemID} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Item's Name: </TableCell>
                    <TableCell>
                      {supply?.name}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Description: </TableCell>
                    <TableCell>
                      {supply?.description}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Price:</TableCell>
                    <TableCell>
                      {supply?.price}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Status:</TableCell>
                    <TableCell>
                      <Chip
                        color={supplyList[0]?.isFinish ? "primary" : "secondary"}
                        label={supplyList[0]?.isFinish ? "Finish" : "Not Finish"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Transfers:</TableCell>
                    <TableCell>
                      {(supplyList || []).map((i, n) =>
                        <div key={n}>
                          <div>{`No.${supplyList.length - n}`}</div>
                          <div style={{ marginLeft: '40px' }}>
                            <div>{`From: ${i?.fromLocation?.name}`}</div>
                            <div>{`To: ${i?.toLocation?.name}`}</div>
                            <div>{`Amount: ${i?.amount}`}</div>
                          </div>
                        </div>
                      )}
                    </TableCell>
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

export default SupplyInfo;
