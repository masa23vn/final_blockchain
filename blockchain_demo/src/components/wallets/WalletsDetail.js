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
import { LINK } from '../../constant/constant'
import axios from 'axios';

const WalletsDetail = (props) => {
  const [supply, setSupply] = useState();
  const [supplyList, setList] = useState([]);
  const { selected } = props;

  useEffect(async () => {
    if (selected) {
      await axios.get(`${LINK.API}/supply/${selected.id}`)
        .then(function (res) {
          const temp = res?.data.concat(selected);
          setSupply(temp[0])
          setList(temp)
        })
        .catch(function (err) {
          console.log(err);
        })
    }

  }, [selected])

  return (
    <Card {...props} style={{ height: '100%' }}>
      <CardHeader title={
        <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography><b>Selected Supply {supply?.supplyID}</b></Typography>
        </Box>
      } />
      <Divider />
      <Box style={{ width: '100%', height: '100%' }}>
        <PerfectScrollbar>
          <Box>
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
                          color={supplyList[supplyList.length - 1]?.isFinish ? "primary" : "secondary"}
                          label={supplyList[supplyList.length - 1]?.isFinish ? "Finish" : "Not Finish"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell style={{ width: '250px' }}> Transfers:</TableCell>
                      <TableCell>
                        {(supplyList || []).map((i, n) =>
                          <div key={n}>
                            <div>{`No.${n + 1}`}</div>
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
      </Box>
    </Card>
  )
};

export default WalletsDetail;
