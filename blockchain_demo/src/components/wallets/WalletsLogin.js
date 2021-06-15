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
  const { values, setValues, handleGetPublicKey, handleGetSupplies } = props
  const [errors, setErrors] = useState({
    url: '',
    password: ''
  })

  const handleChangeUrl = (event) => {
    if (event.target.value.trim() !== '') {
      setErrors({
        ...errors,
        url: ''
      });
    }

    setValues({
      ...values,
      url: event.target.value.trim(),
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
      ...values,
      password: event.target.value.trim()
    });
  };

  return (
    <>
      <form>
        <Card>
          <CardHeader
            title="Login"
            subheader="Connect to your server's blockchain "
          />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Your server's URL"
              margin="normal"
              name="url"
              onChange={handleChangeUrl}
              value={values?.url}
              variant="outlined"
              error={errors.url !== ''}
              helperText={errors.url}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              name="password"
              onChange={handleChangePassword}
              value={values?.password}
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
              style={{ marginLeft: '10px' }}
              color="primary"
              variant="contained"
              onClick={i => handleGetPublicKey()}
            >
              Get public key
          </Button>
            <Button
              style={{ marginLeft: '10px' }}
              color="primary"
              variant="contained"
              onClick={i => handleGetSupplies()}
            >
              Get your unconfirmed supplies
          </Button>
          </Box>
        </Card>
      </form>
    </>
  );
};

export default WalletsLogin;
