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
import { axiosGet, axiosPost } from '../../utils/connectAxios'

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

const NAME = "CONFIRM_STEP2"
const ContinueSupply = (props) => {
  const classes = useStyles();
  const { selected, isOpen, setIsOpen, values, handleOpen, handleGetSupplies  } = props;

  const [error, setError] = useState({
    locationID: false,
  })
  const [locations, setLocations] = useState([]);

  const [newSupply, setNewSupply] = useState({
    locationID: null,
    isFinish: selected.isFinish,
    amount: selected.amount,
  })

  useEffect(() => {
    if (selected) {
      setNewSupply({
        locationID: null,
        isFinish: selected.isFinish ? 1 : 0,
        amount: selected.amount,
      })
    }
    else {
      setNewSupply(null)
    }
  }, [selected]);

  useEffect(() => {
    if (isOpen === NAME) {
      fetchLocations();
    }
  }, [isOpen]);

  const fetchLocations = async () => {
    try {
      const res = await axiosGet(values.url, 'location')
      if (res.length > 0) {
        setLocations(res);
        setNewSupply({
          ...newSupply,
          locationID: res[0]?.id,
        })
      }
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
  }


  const handleCloseConfirmDialog = () => {
    setIsOpen("");
  }

  const handleConfirm = async () => {
    try {
      if (newSupply.locationID === null && locations.length > 0) {
        newSupply.locationID = location[0].id;
      }
      const res = await axiosPost(values.url, 'sendTransactionContinue', {
        toId: newSupply.locationID,
        isFinish: newSupply.isFinish,
        supplyID: selected.supplyID,
        amount: newSupply.amount
      })
      handleOpen("Continued supply successfully", "success");
      handleGetSupplies();
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
    setIsOpen('');
  }

  // supply 
  const handleChange = (event) => {
    setNewSupply({
      ...newSupply,
      [event.target.name]: event.target.value
    });
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
            className={classes.textField}
            size="small"
            id="locationID"
            name="locationID"
            select
            label="Next location"
            value={newSupply?.locationID || 0}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={error.locationID}
            helperText={error.locationID ? 'Invalid Location' : ''}
          >
            {locations && locations.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {`${i.name}: ${i.location}`}
              </MenuItem>
            ))}
            {(!locations || locations.length === 0) &&
              <MenuItem value={0}>
                Location not found
              </MenuItem>
            }
          </TextField>
          <TextField
            className={classes.textField}
            size="small"
            id="isFinish"
            name="isFinish"
            select
            label="Is last location ?"
            value={newSupply?.isFinish}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          >
            <MenuItem value={0}>
              No
            </MenuItem>
            <MenuItem value={1}>
              Yes
            </MenuItem>
          </TextField>
          <TextField
            className={`${classes.textField}`}
            size="small"
            autoFocus
            id="amount"
            name="amount"
            label="Amount"
            type="number"
            value={newSupply?.amount}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button className={`${classes.button} ${classes.closeButton}`} onClick={handleCloseConfirmDialog} variant="contained" >
          Back
        </Button>
        <Button className={`${classes.button} ${classes.confirmButton}`} disabled={!open} onClick={handleConfirm} variant="contained">
          Create
        </Button>

      </DialogActions>
    </Dialog>
  );
}
export default ContinueSupply;

