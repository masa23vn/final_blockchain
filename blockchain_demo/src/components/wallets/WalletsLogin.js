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
import { decryptPrivateKey, getPublicKey } from '../../helper/sign';
import { LINK } from '../../constant/constant'
import axios from 'axios';

const WalletsLogin = (props) => {
  const { encryphted, password, setValues, handleGetTransaction, handleOpen } = props
  const [errors, setErrors] = useState({
    encryphted: '',
    password: ''
  })

  const handleChangeEncryphted = (event) => {
    if (event.target.value.trim() !== '') {
      setErrors({
        ...errors,
        encryphted: ''
      });
    }

    setValues({
      encryphted: event.target.value.trim(),
      password: password
    });
  };

  const handleChangePassword = (event) => {
    if (event.target.value.trim() !== '') {
      setErrors({
        ...errors,
        password: ''
      });
    }

    setValues({
      encryphted: encryphted,
      password: event.target.value.trim()
    });
  };

  const handleGetPublicKey = () => {
    if (encryphted === '') {
      setErrors({
        ...errors,
        encryphted: "This field can't be blank."
      })
      return
    }
    if (password === '') {
      setErrors({
        ...errors,
        password: "This field can't be blank."
      })
      return
    }
    try {
      const privateKey = decryptPrivateKey(encryphted, password)
      const publicKey = getPublicKey(privateKey)
      handleOpen("Your public key: " + publicKey, 'success')
    }
    catch (error) {
      handleOpen(error.message, 'error')
    }
  }

  const handleGetBalance = async () => {
    if (encryphted === '') {
      setErrors({
        ...errors,
        encryphted: "This field can't be blank."
      })
      return
    }
    if (password === '') {
      setErrors({
        ...errors,
        password: "This field can't be blank."
      })
      return
    }
    try {
      const privateKey = decryptPrivateKey(encryphted, password);
      const publicKey = getPublicKey(privateKey)
      axios.post(`${LINK.API}/balanceGuess`, { address: publicKey })
        .then(function (res) {
          handleOpen("Your balance: " + res?.data?.balance, "success");
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

  const handleTransaction = () => {
    if (encryphted === '') {
      setErrors({
        ...errors,
        encryphted: "This field can't be blank."
      })
      return
    }
    if (password === '') {
      setErrors({
        ...errors,
        password: "This field can't be blank."
      })
      return
    }

    handleGetTransaction();
  }

  return (
    <>
      <form>
        <Card>
          <CardHeader
            title="Login"
            subheader="Your info will only be kept at client's side and will be deleted when you close this tab "
          />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Encrypted Key"
              margin="normal"
              name="encryphted"
              onChange={handleChangeEncryphted}
              value={encryphted}
              variant="outlined"
              error={errors.encryphted !== ''}
              helperText={errors.encryphted}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              name="password"
              onChange={handleChangePassword}
              value={password}
              variant="outlined"
              error={errors.password !== ''}
              helperText={errors.password}
            />
          </CardContent>
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
              onClick={() => handleGetPublicKey()}
            >
              Get Public Key
          </Button>
            <Button
              style={{ marginLeft: '10px' }}
              color="primary"
              variant="contained"
              onClick={() => handleGetBalance()}
            >
              Get Balance
          </Button>
            <Button
              style={{ marginLeft: '10px' }}
              color="primary"
              variant="contained"
              onClick={() => handleTransaction()}
            >
              Get Transaction
          </Button>
          </Box>
        </Card>
      </form>
    </>
  );
};

export default WalletsLogin;
