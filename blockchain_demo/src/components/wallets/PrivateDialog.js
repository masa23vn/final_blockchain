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

const NAME = "PRIVATE_DIALOG"
const PrivateDialog = (props) => {
  const classes = useStyles();
  const { isOpen, setIsOpen, privateKey } = props;
  console.log(privateKey)
  const handleClose = () => {
    setIsOpen('');
  }

  const open = isOpen === NAME;
  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title" >
        <Typography className={classes.title}>
          Your new private key
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
            value={privateKey}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button className={`${classes.button} ${classes.closeButton}`} onClick={handleClose} variant="contained" >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default PrivateDialog;

