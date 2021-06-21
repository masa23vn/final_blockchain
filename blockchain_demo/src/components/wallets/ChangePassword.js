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

const NAME = "CHANGE_PASSWORD"
const ChangePassword = (props) => {
  const classes = useStyles();
  const { isOpen, values, setIsOpen, handleOpen } = props;
  const [newPassword, setNewPassword] = useState({
    password: ''
  })
  const [error, setError] = useState({
    password: false,
  })

  useEffect(() => {
    if (isOpen === NAME) {
      setNewPassword({
        password: '',
      })
      setError({
        password: false,
      })
    }
  }, [isOpen]);

  const handleCloseChangePassDialog = () => {
    setIsOpen('');
  }

  const handleChangePass = async () => {
    try {
      if (newPassword?.password.trim() === '') {
        setError({
          ...error,
          password: true,
        })
        return;
      }
      const res = await axiosPost(values.url, 'changePass', { newPass: newPassword?.password })
      handleOpen("Change password successfully", "success");
    }
    catch (error) {
      handleOpen(error?.response?.data || error?.message, 'error')
    }
    setIsOpen('');
  }

  const handleChange = (event) => {
    if (event.target.name === 'password' && event.target.value.trim() !== '') {
      setError({
        ...error,
        password: false,
      })
    }

    setNewPassword({
      ...newPassword,
      [event.target.name]: event.target.value
    });
  }

  const open = isOpen === NAME;
  return (
    <Dialog open={open} onClose={handleCloseChangePassDialog} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title" >
        <Typography className={classes.title}>
          Update password
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <TextField
            className={`${classes.textField}`}
            size="small"
            autoFocus
            id="password"
            name="password"
            label="New password"
            value={newPassword?.password}
            type="password"
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            variant="outlined"
            error={error.password}
            helperText={error.password ? 'New password must not be blank' : ''}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button className={`${classes.button} ${classes.closeButton}`} onClick={handleCloseChangePassDialog} variant="contained" >
          Cancel
        </Button>
        <Button className={`${classes.button} ${classes.addButton}`} disabled={!open} onClick={handleChangePass} variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default ChangePassword;

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
    margin: '10px 0px 15px 0px',
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

