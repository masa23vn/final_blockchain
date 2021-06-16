import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Snackbar,
  Alert,
  Grid
} from '@material-ui/core';
import { LINK } from '../constant/constant'
import { axiosGet } from '../utils/connectAxios'
import WalletsList from '../components/wallets/WalletsList';
import WalletsLogin from '../components/wallets/WalletsLogin';
import WalletsDetail from '../components/wallets/WalletsDetail';

import { set } from 'lodash';



const WalletsView = () => {
  const [login, setLogin] = useState(false);
  const [values, setValues] = useState({
    url: "http://localhost:9000",
    password: '',
  });
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState();

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleGetPublicKey = async () => {
    try {
      const res = await axiosGet(values.url, 'address')
      handleOpen(res?.address, "success");
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
  }

  const handleGetSupplies = async () => {
    try {
      const res = await axiosGet(values.url, 'supplyByLocation')
      setData(res);
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
  }


  // snack bar
  const [open, setOpen] = useState(false);
  const [snackMess, setSnackMess] = useState('');
  const [snackType, setSnackType] = useState('error');
  const handleOpen = (snackMess, snackType) => {
    setSnackMess(snackMess);
    setSnackType(snackType);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  console.log(selected)
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        key={'topcenter'}
      >
        <Alert onClose={handleClose} severity={snackType}>
          {snackMess}
        </Alert>
      </Snackbar>

      <Helmet>
        <title>Wallets | Material Kit</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          <h3 style={{ marginTop: '20px', marginLeft: '15px' }}>Connect to your server</h3>
          <Box style={{ paddingTop: '10px' }}>
            <WalletsLogin values={values} setValues={setValues} handleGetPublicKey={handleGetPublicKey} handleGetSupplies={handleGetSupplies} />
          </Box>
          <Box style={{ paddingTop: '10px' }}>
          </Box>

          <Grid
            container
            spacing={3}
            style={{ marginTop: '20px', marginBottom: '80px' }}
          >
            <Grid style={{ pt: 3, minHeight: '700px', maxHeight: '700px' }}
              item
              lg={4}
              sm={4}
              xl={4}
              xs={12}
            >
              <WalletsList data={data} setSelected={setSelected} />
            </Grid>
            <Grid style={{ pt: 3, minHeight: '700px', maxHeight: '700px' }}
              item
              lg={8}
              sm={8}
              xl={8}
              xs={12}
            >
              <WalletsDetail values={values} selected={selected} handleOpen={handleOpen} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
};

export default WalletsView;
