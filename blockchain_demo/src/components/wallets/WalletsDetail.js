import React, { useState, useEffect, useContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  Button,
  TableRow,
  Typography,
} from '@material-ui/core';
import { LINK } from '../../constant/constant'
import axios from 'axios';
import ConfirmSupply from './ConfirmSupply'
import ContinueSupply from './ContinueSupply'

const WalletsDetail = (props) => {
  const [supply, setSupply] = useState();
  const [supplyList, setList] = useState([]);
  const [unconfirm, setUnconfirm] = useState(false);
  const { selected, values, handleOpen } = props;

  useEffect(async () => {
    if (selected) {
      const temp = selected.data.slice().reverse();
      setSupply(temp[0]);
      setList(temp);
      setUnconfirm(selected.hasUnConfirm)
    }

  }, [selected])

  const [isOpen, setIsOpen] = useState('');
  const handleConfirm = () => {
    if (unconfirm) {
      setIsOpen("CONFIRM_STEP1")
    }
    else {
      setIsOpen("CONFIRM_STEP2")
    }
  }

  return (
    <Card style={{ height: '100%' }}>
      <CardHeader title={
        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
          {supply ?
            <>
              <Typography><b>Supply {supply?.supplyID}</b></Typography>
              <Button variant="contained" style={{ backgroundColor: '#1DAF1A' }} onClick={i => handleConfirm()}>
                {unconfirm ? "Confirm" : "Continue Supply"}
              </Button>
              <ConfirmSupply selected={supply} isOpen={isOpen} setIsOpen={setIsOpen} values={values} handleOpen={handleOpen} />
              <ContinueSupply selected={supply} isOpen={isOpen} setIsOpen={setIsOpen} values={values} handleOpen={handleOpen} />
            </>
            : <Typography><b>Supply's Info</b></Typography>
          }
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
                            <div>
                              {`No.${supplyList.length - n}  `}
                              <span style={{ color: 'red' }}>{n === 0 && unconfirm ? "(Unconfirmed)" : ""}</span>
                            </div>
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
