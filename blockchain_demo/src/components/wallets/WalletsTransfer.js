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
import { createTransaction, decryptPrivateKey } from '../../helper/sign';
import { LINK } from '../../constant/constant'
import axios from 'axios';

const WalletsTransfer = (props) => {
  const { encryphted, password, handleOpen } = props
  const [values, setValues] = useState({
    public: '',
    amount: ''
  });
  const [errors, setErrors] = useState({
    public: '',
    amount: ''
  })

  const handleChange = (event) => {
    if (event.target.value.trim() !== '') {
      setErrors({
        ...errors,
        [event.target.name]: ''
      });
    }

    setValues({
      ...values,
      [event.target.name]: event.target.value.trim()
    });
  };


  const sendTransaction = () => {
    if (values.public === '') {
      setErrors({
        ...errors,
        public: "This field can't be blank."
      })
      return
    }
    if (values.amount === '') {
      setErrors({
        ...errors,
        amount: "This field can't be blank."
      })
      return
    }

    if (isNaN(values.amount)) {
      setErrors({
        ...errors,
        amount: "This field must be integer number."
      })
      return
    }

    const privateKey = decryptPrivateKey(encryphted, password);
    // get unSpent
    axios.get(`${LINK.API}/unSpent`)
      .then(function (res) {
        const unSpent = res.data
        // get transaction pool
        axios.get(`${LINK.API}/pool`)
          .then(function (res) {
            const pool = res.data
            try {
              // create and sign transaction locally
              const tx = createTransaction(values.public, Number(values.amount), privateKey, unSpent, pool)
              console.log(tx)
              // send transaction to server
              axios.post(`${LINK.API}/sendTransactionGuess`, { transaction: tx })
                .then(function (res) {
                  handleOpen("Created transaction successfully. Now wait for someone to mine it", "success");
                })
                .catch(function (err) {
                  if (err?.response && err?.response?.data) {
                    handleOpen(err?.response?.data, "error");
                  }
                  else {
                    handleOpen(err.message, "error");
                  }
                })
            } catch (err) {
              handleOpen(err.message, "error");
            }
          })
          .catch(function (err) {
            handleOpen(err.message, "error");
          })
      })
      .catch(function (err) {
        handleOpen(err.message, "error");
      })
  }

  return (
    <>
      <form>
        <Card>
          <CardHeader
            title="Create new transaction"
            subheader="Send coin to another user through their public key. NEED TO LOGIN TO USE"
          />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Public Key"
              margin="normal"
              name="public"
              onChange={handleChange}
              value={values.public}
              variant="outlined"
              error={errors.public !== ''}
              helperText={errors.public}
            />
            <TextField
              fullWidth
              label="Amount"
              margin="normal"
              name="amount"
              onChange={handleChange}
              value={values.amount}
              variant="outlined"
              error={errors.amount !== ''}
              helperText={errors.amount}
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
              onClick={() => sendTransaction()}
            >
              Create
          </Button>
          </Box>
        </Card>
      </form>
    </>
  );
};

export default WalletsTransfer;
