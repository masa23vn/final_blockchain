import React, { useState, useEffect, useContext } from 'react';
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
import { Search as SearchIcon } from 'react-feather';

const rowHeight = 53;

const LatestBlocks = (props) => {
  const [blocks, setBlocks] = useState([]);

  // search
  const [filterList, setFilterList] = useState(blocks);
  const [searchInput, setSearchInput] = useState('');

  const changeSearchInput = (e) => {
    setSearchInput(e.target.value);
  }

  useEffect(() => {
    let filtered = blocks;
    if (searchInput !== '') {
      filtered = filtered.filter(i => i?.index === Number(searchInput));
    }
    setFilterList(filtered)
    setPage(0)
  }, [blocks, searchInput])


  // page
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState();
  const [emptyRows, setEmptyRows] = useState();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (props.data) {
      props.data.sort((a, b) => {
        if (a.index < b.index) {
          return 1
        }
        else if (a.index > b.index) {
          return -1
        }
        else {
          return 0
        }

      })
    }
    setBlocks(props.data || [])
  }, [props.data]);

  useEffect(() => {
    const temp1 = filterList || [];
    const temp2 = temp1 ? rowsPerPage - Math.min(rowsPerPage, temp1.length - page * rowsPerPage) : 0;
    setRows(temp1);
    setEmptyRows(temp2);
  }, [filterList, page]);


  return (
    <Card {...props}>
      <CardHeader title={
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography><b>Latest Blocks ({rows?.length})</b></Typography>
          <TextField style={{ minWidth: '300px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SvgIcon
                    fontSize="small"
                    color="action"
                  >
                    <SearchIcon />
                  </SvgIcon>
                </InputAdornment>
              )
            }}
            size="small"
            placeholder="Search block's index"
            variant="outlined"
            value={searchInput}
            onChange={changeSearchInput}
          />
        </Box>
      } />
      <Divider />
      <PerfectScrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Block Index
              </TableCell>
                <TableCell >
                  Date Added
              </TableCell>
                <TableCell align="right">
                  Difficulty
              </TableCell>
                <TableCell align="right">
                  Transactions
              </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rows || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((block, index) => {
                return (
                  <TableRow
                    hover
                    key={block?.index}
                  >
                    <TableCell>
                      <Link to={`/block/${block?.index}`}>{block?.index}</Link>
                    </TableCell>
                    <TableCell >
                      {moment(block?.timestamp).format("DD/MM/yyyy hh:MM:ss")}
                    </TableCell>
                    <TableCell align="right">
                      {block?.difficulty}
                    </TableCell>
                    <TableCell align="right">
                      {block?.data?.length ? block?.data?.length : 0}
                    </TableCell>
                  </TableRow>
                )
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: rowHeight * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>

          </Table>
        </Box>
      </PerfectScrollbar>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        <TablePagination
          rowsPerPageOptions={[5]}
          count={rows ? rows.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          component='div'
          onPageChange={handleChangePage}
        />
      </Box>
    </Card>
  )
};

export default LatestBlocks;
