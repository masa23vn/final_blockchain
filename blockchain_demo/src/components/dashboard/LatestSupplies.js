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

const rowHeight = 73;

const WalletsSupplies = (props) => {
  const [supplies, setSupplies] = useState([]);

  // search
  const [filterList, setFilterList] = useState(supplies);
  const [searchInput, setSearchInput] = useState('');

  const changeSearchInput = (e) => {
    setSearchInput(e.target.value);
  }

  useEffect(() => {
    let filtered = supplies;
    if (searchInput !== '') {
      filtered = filtered.filter(i => i?.supplyID.includes(searchInput));
    }
    setFilterList(filtered)
    setPage(0)
  }, [supplies, searchInput])

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState();
  const [emptyRows, setEmptyRows] = useState();

  useEffect(() => {
    if (props.data) {
      props.data.reverse()
    }
    setSupplies(props.data || [])
  }, [props.data]);

  useEffect(() => {
    const temp1 = filterList || [];
    const temp2 = temp1 ? rowsPerPage - Math.min(rowsPerPage, temp1.length - page * rowsPerPage) : 0;
    setRows(temp1);
    setEmptyRows(temp2);
  }, [filterList, page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const style1 = {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
  }

  const style2 = {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "20%",
    overflow: "hidden"
  }

  const style3 = {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "10%",
    overflow: "hidden"
  }

  return (
    <Card {...props}>
      <CardHeader title={
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography><b>Latest Supply ({rows?.length})</b></Typography>
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
            placeholder="Search supplies's id"
            variant="outlined"
            value={searchInput}
            onChange={changeSearchInput}
          />
        </Box>
      } />
      <Divider />
      <PerfectScrollbar>
        <Box style={{ width: '100%' }}>
          <Table >
            <TableHead>
              <TableRow>
                <TableCell >
                  <Typography >ID</Typography>
                </TableCell>
                <TableCell style={style2}>
                  Item's ID
              </TableCell>
                <TableCell style={style2}>
                  Item's Name
              </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rows || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sp, index) => {
                return (
                  <TableRow hover key={sp.id}>
                    <TableCell >
                      <div style={style1}>
                        <Link to={`/supply/${sp.supplyID}`}>{sp.supplyID}</Link>
                      </div>
                    </TableCell>
                    <TableCell >
                      <div>
                        {sp?.itemID}
                      </div>
                    </TableCell>
                    <TableCell >
                      <div >
                        {sp?.name}
                      </div>
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

export default WalletsSupplies;
