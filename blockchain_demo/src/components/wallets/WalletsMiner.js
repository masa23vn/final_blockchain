import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Snackbar,
  Alert
} from '@material-ui/core';
import { getPublicKey, decryptPrivateKey } from '../../helper/sign';
import { LINK } from '../../constant/constant'
import axios from 'axios';

const WalletsMiner = (props) => {
  const { encryphted, password, handleOpen } = props

  const handleMine = () => {
    try {
      const privateKey = decryptPrivateKey(encryphted, password);
      const publicKey = getPublicKey(privateKey)
      axios.post(`${LINK.API}/mineBlockGuess`, { address: publicKey })
        .then(function (res) {
          handleOpen("Start mining", "success");
        })
        .catch(function (err) {
          if (err?.response) {
            handleOpen(err?.response?.data, "error");

          }
          else {
            handleOpen(err.message, "error");

          }
        })
    } catch (error) {
      handleOpen(error.message, 'error')
    }
  }

  return (
    <>
      <form>
        <Card>
          <CardHeader
            title="Mine Coin"
            subheader="Start mining at our server. NEED TO LOGIN TO USE"
          />
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2
            }}
          >
            <Button
              color="primary"
              variant="contained"
              onClick={() => handleMine()}
            >
              Start mining
          </Button>
          </Box>
        </Card>
      </form>
    </>
  );
};

export default WalletsMiner;
