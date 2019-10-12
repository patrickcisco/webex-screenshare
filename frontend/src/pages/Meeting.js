// react core
import React, {useState} from 'react';
import {
  Redirect,
  useParams
} from "react-router-dom";

import ReactSVG from 'react-svg';

// material ui
import { Button } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

// cs
import './Meeting.css';

import DevNet from './devnet.svg'

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  progress: {
    margin: theme.spacing(2),
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Meeting(props) {
    const [name, setName] = useState("");
    const [joinMeeting, setJoinMeeting] = useState(false);
    const classes = useStyles();
    let { id } = useParams();

    const encodedName = Buffer.from(name).toString('base64');
  
    return (
    <div className="Meeting">
    {/* <ReactSVG src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" /> */}
    <ReactSVG src={DevNet}/>
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <form className={classes.form} noValidate onSubmit={e => {
          e.preventDefault();
          setJoinMeeting(true);
        }} >
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="name"
                label="Display Name"
                autoComplete="Name"
                onChange={e => {setName(e.target.value)}}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
              Join Meeting
            </Button>
        </form>
        {joinMeeting && 
        <Redirect
            to={{
              pathname: `/activemeeting/${id}/${encodedName}`,
            }}
          />
        }
      </div>
    </Container>
    </div>
    )
}

export default Meeting;