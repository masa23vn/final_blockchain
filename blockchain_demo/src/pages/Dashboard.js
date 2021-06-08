import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Grid
} from '@material-ui/core';
import LatestBlocks from '../components/dashboard/LatestBlocks';
import LatestTransactions from '../components/dashboard/LatestTransactions';
import TotalBlock from '../components/dashboard/TotalBlock';
import TotalTransaction from '../components/dashboard/TotalTransaction';
import { LINK } from '../constant/constant'
import axios from 'axios';

const Dashboard = () => {
  const [blocks, setBlocks] = useState([]);
  const [txs, setTxs] = useState([]);

  useEffect(async () => {
    await axios.get(`${LINK.API}/blocks`)
      .then(function (res) {
        setBlocks(res.data)
      })
      .catch(function (err) {
        console.log(err);
      })

    await axios.get(`${LINK.API}/finishPool`)
      .then(function (res) {
        setTxs(res.data)
      })
      .catch(function (err) {
        console.log(err);
      })


  }, [])
  
  return (
    <>
      <Helmet>
        <title>Dashboard | Material Kit</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              lg={6}
              sm={6}
              xl={6}
              xs={12}
            >
              <TotalBlock sx={{ height: '100%' }} amount={blocks?.length || 0} />
            </Grid>
            <Grid
              item
              lg={6}
              sm={6}
              xl={6}
              xs={12}
            >
              <TotalTransaction sx={{ height: '100%' }} amount={blocks?.length || 0} />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <LatestBlocks data={blocks} />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <LatestTransactions data={txs} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
};

export default Dashboard;
