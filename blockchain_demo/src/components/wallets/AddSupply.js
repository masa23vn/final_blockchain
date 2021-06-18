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

const NAME = "ADD_SUPPLY"
const AddSupply = (props) => {
  const classes = useStyles();
  const { isOpen, setIsOpen, values, handleOpen, handleGetSupplies } = props;
  const [locations, setLocations] = useState([]);
  const [newSupply, setNewSupply] = useState({
    itemID: '',
    name: '',
    price: 0,
    amount: 0,
    isFinish: 0,
    description: '',
    locationId: null,
  })
  const [error, setError] = useState({
    itemID: false,
    name: false,
    price: false,
    amount: false,
    isFinish: false,
    description: false,
    locationId: false,
  })

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (isOpen === NAME) {
      setNewSupply({
        itemID: '',
        name: '',
        price: 0,
        amount: 0,
        isFinish: 0,
        description: '',
        locationId: locations[0]?.id,
      })
      setError({
        itemID: false,
        name: false,
        amount: false,
        isFinish: false,
        description: false,
        locationId: false,
      })
    }
  }, [isOpen]);

  const fetchLocations = async () => {
    try {
      const res = await axiosGet(values.url, 'location')
      if (res.length > 0) {
        setLocations(res);
        setNewSupply({
          ...newSupply,
          locationId: res[0]?.id,
        })
      }
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
  }

  const handleCloseAddDialog = () => {
    setIsOpen('');
  }

  const handleAdd = async () => {
    try {
      if (newSupply.itemID.trim() === '') {
        setError({
          ...error,
          itemID: true,
        })
        return;
      }
      if (newSupply.name.trim() === '') {
        setError({
          ...error,
          name: true,
        })
        return;
      }

      if (newSupply.locationId === null && locations.length > 0) {
        newSupply.locationId = location[0].id;
      }
      const res = await axiosPost(values.url, 'sendTransaction', newSupply)
      handleOpen("Add supply successfully", "success");
      handleGetSupplies();
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
    setIsOpen('');
  }

  const handleChange = (event) => {
    if (event.target.name === 'itemID' && event.target.value.trim() !== '') {
      setError({
        ...error,
        itemID: false,
      })
    }

    if (event.target.name === 'name' && event.target.value.trim() !== '') {
      setError({
        ...error,
        name: false,
      })
    }

    setNewSupply({
      ...newSupply,
      [event.target.name]: event.target.value
    });
  }

  const open = isOpen === NAME;
  return (
    <Dialog open={open} onClose={handleCloseAddDialog} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title" >
        <Typography className={classes.title}>
          Add new supply
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
            label="Item's ID"
            value={newSupply?.itemID}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            error={error.itemID}
            helperText={error.itemID ? 'ID must not be blank' : ''}
          />
          <TextField
            className={`${classes.textField}`}
            size="small"
            id="name"
            name="name"
            label="Item's Name"
            value={newSupply?.name}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            error={error.name}
            helperText={error.name ? 'Name must not be blank' : ''}
          />
          <TextField
            className={`${classes.textField}`}
            size="small"
            id="price"
            name="price"
            label="Price"
            type="number"
            value={newSupply?.price}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
          />
          <TextField
            className={`${classes.textField}`}
            size="small"
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
          <TextField
            className={classes.textField}
            size="small"
            id="locationId"
            name="locationId"
            select
            label="Next location"
            value={newSupply?.locationId || 0}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={error.locationId}
            helperText={error.locationId ? 'Invalid Location' : ''}
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
            className={classes.textField}
            name="description"
            size="small"
            value={newSupply?.description}
            onChange={handleChange}
            id="description"
            label="Description"
            multiline
            rows={10}
            fullWidth
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button className={`${classes.button} ${classes.closeButton}`} onClick={handleCloseAddDialog} variant="contained" >
          Cancel
        </Button>
        <Button className={`${classes.button} ${classes.addButton}`} disabled={!open} onClick={handleAdd} variant="contained">
          Add
        </Button>

      </DialogActions>
    </Dialog>
  );
}
export default AddSupply;

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
  addButton: {
    width: '130px',
    backgroundColor: '#1DAF1A',
    "&:hover": {
      backgroundColor: "#1DAF1A"
    }
  },
}));

