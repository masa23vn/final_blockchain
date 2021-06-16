import React, { useContext, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  MenuItem,
  DialogTitle,
  Typography,
  TextField,
  Avatar,
  Button,
  Box,
  DialogActions,
  makeStyles,
  createStyles
} from '@material-ui/core';
import { axiosPost } from '../../utils/connectAxios'

const useStyles = makeStyles(() => createStyles({
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '-10px'
  },
  subtitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '10px 0px'
  },
  textField: {
    margin: '10px 0px 15px 0px'
  },
  button: {
    borderRadius: '4px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    padding: '5px 35px',
    marginLeft: '20px'
  },
  closeButton: {
    width: '130px',
    backgroundColor: '#F50707',
    "&:hover": {
      backgroundColor: "#F50707"
    }
  },
  confirmButton: {
    width: '130px',
    backgroundColor: '#1DAF1A',
    "&:hover": {
      backgroundColor: "#1DAF1A"
    }
  },
}));

const NAME = "CONFIRM_STEP1"
const ConfirmSupply = (props) => {
  const classes = useStyles();
  const { selected, isOpen, setIsOpen, values, handleOpen } = props;

  const handleCloseConfirmDialog = () => {
    setIsOpen('');
  }

  const handleConfirm = async () => {
    try {
      const res = await axiosPost(values.url, 'mineBlockWithSupply', { supplyID: selected?.supplyID })
      handleOpen("Confirmed supply successfully", "success");
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
    setIsOpen('');
  }

  const open = isOpen === NAME;
  return (
    <Dialog open={open} onClose={handleCloseConfirmDialog} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title" >
        <Typography className={classes.title}>
          Create next supply
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <TextField
            className={`${classes.textField}`}
            size="small"
            autoFocus
            id="itemID"
            name="itemID"
            label="ID"
            value={selected?.itemID}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
          />
          <TextField
            className={`${classes.textField}`}
            size="small"
            autoFocus
            id="name"
            name="name"
            label="Name"
            value={selected?.name}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
          />
          <TextField
            className={`${classes.textField}`}
            size="small"
            autoFocus
            id="amount"
            name="amount"
            label="Amount"
            type="number"
            value={selected?.amount}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
          />
          <TextField
            className={`${classes.textField}`}
            size="small"
            autoFocus
            id="isFinish"
            name="isFinish"
            label="Is last location ?"
            value={selected?.isFinish ? "Yes" : "No"}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
          />
          <TextField
            className={classes.textField}
            name="description"
            size="small"
            value={selected.description}
            id="description"
            label="Description"
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button className={`${classes.button} ${classes.closeButton}`} onClick={handleCloseConfirmDialog} variant="contained" >
          Cancel
        </Button>
        <Button className={`${classes.button} ${classes.confirmButton}`} disabled={!open} onClick={handleConfirm} variant="contained">
          Confirm
        </Button>

      </DialogActions>
    </Dialog>
  );
}
export default ConfirmSupply;

