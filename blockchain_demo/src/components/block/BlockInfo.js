import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'
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

const BlockInfo = (props) => {
  const [block, setBlock] = useState();
  const ID = useParams().id;

  useEffect(async () => {
    await axios.get(`${LINK.API}/block/${ID}`)
      .then(function (res) {
        setBlock(res.data)
      })
      .catch(function (err) {
        console.log(err);
      })

  }, [])

  return (
    <Card {...props}>
      <CardHeader title={`Block ${block?.index || "not found"}`} />
      <Divider />
      <PerfectScrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableBody>
              {block &&
                <>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Index: </TableCell>
                    <TableCell> {block?.index} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Created at: </TableCell>
                    <TableCell>
                      {moment(block?.timestamp).format("DD/MM/yyyy hh:MM:ss")}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Difficulty: </TableCell>
                    <TableCell> {block?.difficulty} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Hash: </TableCell>
                    <TableCell> {block?.hash} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Previous hash: </TableCell>
                    <TableCell> {block?.previousHash} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Number of Transactions:</TableCell>
                    <TableCell>{block?.data?.length ? block?.data?.length : 0} </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell style={{ width: '250px' }}> Transactions:</TableCell>
                    <TableCell>
                      {(block?.data || []).map((i, n) =>
                        <div key={n}>
                          {n + 1}:  <Link to={`/transaction/${i.id}`}>{i.id}</Link>
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

export default BlockInfo;
