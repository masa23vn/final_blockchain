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

const NAME = "ADD_LOCATION"
const AddLocation = (props) => {
  const classes = useStyles();
  const { isOpen, setIsOpen, values, handleOpen } = props;
  const [newLocation, setNewLocation] = useState({
    name: '',
    location: '',
  })
  const [error, setError] = useState({
    name: false,
    location: false,
  })

  useEffect(() => {
    if (isOpen === NAME) {
      setNewLocation({
        name: '',
        location: '',
      })
      setError({
        name: false,
        location: false,
      })
    }
  }, [isOpen]);

  const handleCloseAddDialog = () => {
    setIsOpen('');
  }

  const handleAdd = async () => {
    try {
      if (newLocation.name.trim() === '') {
        setError({
          ...error,
          name: true,
        })
        return;
      }
      if (newLocation.location.trim() === '') {
        setError({
          ...error,
          location: true,
        })
        return;
      }

      const res = await axiosPost(values.url, 'addLocation', newLocation)
      handleOpen("Add location successfully", "success");
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
    setIsOpen('');
  }

  const handleChange = (event) => {
    if (event.target.name === 'name' && event.target.value.trim() !== '') {
      setError({
        ...error,
        name: false,
      })
    }

    if (event.target.name === 'location' && event.target.value.trim() !== '') {
      setError({
        ...error,
        location: false,
      })
    }

    setNewLocation({
      ...newLocation,
      [event.target.name]: event.target.value
    });
  }

  const open = isOpen === NAME;
  return (
    <Dialog open={open} onClose={handleCloseAddDialog} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title" >
        <Typography className={classes.title}>
          Add new location
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <TextField
            className={`${classes.textField}`}
            size="small"
            autoFocus
            id="name"
            name="name"
            label="Name"
            value={newLocation?.name}
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
            id="location"
            name="location"
            label="Location's address"
            value={newLocation?.location}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            error={error.location}
            helperText={error.location ? "Location's address must not be blank" : ''}
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
export default AddLocation;

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

