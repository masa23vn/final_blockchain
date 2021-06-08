import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Snackbar,
  Alert
} from '@material-ui/core';
import WalletsTransfer from '../components/wallets/WalletsTransfer';
import WalletsMiner from '../components/wallets/WalletsMiner';
import WalletsCreate from '../components/wallets/WalletsCreate';
import WalletsLogin from '../components/wallets/WalletsLogin';
import WalletsTransactions from '../components/wallets/WalletsTransactions';
import { LINK } from '../constant/constant'
import axios from 'axios';
import { decryptPrivateKey, getPublicKey } from '../helper/sign';



const WalletsView = () => {
  const [values, setValues] = useState({
    encryphted: '',
    password: '',
  });

  const [walletTx, setWalletTx] = useState();

  const handleGetTransaction = async () => {
    try {
      const privateKey = decryptPrivateKey(values.encryphted, values.password)
      const publicKey = getPublicKey(privateKey)
      await axios.post(`${LINK.API}/finishPoolGuess`, { address: publicKey })
        .then(function (res) {
          setWalletTx(res.data)
        })
        .catch(function (err) {
          if (err?.response) {
            handleOpen(err?.response?.data, "error");

          }
          else {
            handleOpen(err.message, "error");

          }
        })
    }
    catch (error) {
      handleOpen(error.message, 'error')
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
        <Container maxWidth="lg">
          <h3 style={{ marginLeft: 15 }}>Don't have a wallet ?</h3>
          <Box sx={{ pt: 3 }}>
            <WalletsCreate handleOpen={handleOpen} />
          </Box>
          <h3 style={{ marginTop: 20, marginLeft: 15 }}>Using your wallet</h3>
          <Box sx={{ pt: 3 }}>
            <WalletsLogin encryphted={values.encryphted} password={values.password}
              setValues={setValues} handleGetTransaction={handleGetTransaction} handleOpen={handleOpen} />
          </Box>
          <Box sx={{ pt: 3 }}>
            <WalletsTransactions data={walletTx} handleOpen={handleOpen} />
          </Box>
          <Box sx={{ pt: 3 }}>
            <WalletsTransfer encryphted={values.encryphted} password={values.password} handleOpen={handleOpen} />
          </Box>
          <Box sx={{ pt: 3 }}>
            <WalletsMiner encryphted={values.encryphted} password={values.password} handleOpen={handleOpen} />
          </Box>

        </Container>
      </Box>
    </>
  )
};

export default WalletsView;
