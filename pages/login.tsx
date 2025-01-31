/* eslint-disable @next/next/no-title-in-document-head */
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert, Button, Card, CircularProgress, Collapse, Container, FormControl, FormHelperText, Grid, IconButton, Input, InputLabel, TextField, Typography } from "@mui/material";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { InputAdornment } from '@material-ui/core';
import { NextPage } from "next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useEffect, useState } from "react";
import { onLoginSubmit, setLoginState, setPassword, setUsername } from "../Models/Users/UsersSlice";
import Router, { useRouter } from 'next/router';
import Head from 'next/head';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 88,
      padding: 16,
      position: 'relative',
    },
    loaderWrapper: {
      marginTop: 16,
      display: 'flex',
      justifyContent: 'center',
    },
  })
);

const Login: NextPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const state = useSelector((reduxState: RootState) => reduxState);
  const { loginError } = state.users;
  const token = state.users.currentUser.token;
  const { username, password, status } = state.users.loggValues;

  const [visibility, setVisibility] = useState<Boolean>(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };
  const handleClickShowPassword = () => {
    setVisibility(!visibility);
  };

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton size="small" aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
        {visibility ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    </InputAdornment>
  );

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.target.value.slice(0, 32);

  };
  const handleBlur = (name: string): boolean => {
    let err = '';
    if (name === 'username' && !username) {
      err = 'Campo Requerido';
    } else if (name === 'password') {
      if (!password) err = 'Campo Requerido';
      else if (password.length < 8) err = 'Password inválido';
    }
    setErrors({
      ...errors,
      [name]: err,
    });
    if(err !== '') 
      dispatch(setLoginState('none'))
    return !!err;
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handleBlur('username') || handleBlur('password')) {
      return;
    }
    dispatch(onLoginSubmit())
    if(status === 'ok') {
      Router.push('/');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case 'username':
        dispatch(setUsername(value));
        break;
      case 'password':
        dispatch(setPassword(value));
        break;
    }
    if (handleBlur('username') || handleBlur('password')) {
      dispatch(setLoginState('none'))

      return;
    }
    dispatch(setLoginState('ok'))
  };

  const router = useRouter();
  const name = router.pathname.split('/');

  useEffect(()=>{
    if(token) router.push('/');
  }, [token])
  
  return (
  <div>
    <Head>
      <title>{name}</title>
    </Head>
    <form onSubmit={handleOnSubmit}>
      <Container maxWidth="xs" className={classes.root} component={Card}>
        <Grid container spacing={2}>
          <Grid item xs={12} alignContent='center'>
            <Typography variant="h4">{'Articles app'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="standard"
              fullWidth
              name="username"
              label={'Nombre de Usuario'}
              value={username || ''}
              onChange={handleChange}
              onInput={(e) => handleInput(e as React.ChangeEvent<HTMLInputElement>)}
              onBlur={() => handleBlur('username')}
              error={!!errors.username}
              helperText={errors.username}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.password}>
              <InputLabel htmlFor="password-input">{'Contraseña'}</InputLabel>
              <Input
                id="password-input"
                type={visibility ? 'text' : 'password'}
                value={password || ''}
                name="password"
                onChange={handleChange}
                endAdornment={endAdornment}
                onInput={(e) => handleInput(e as React.ChangeEvent<HTMLInputElement>)}
                onBlur={() => handleBlur('password')}
              />
              <FormHelperText id="password-error">{errors.password}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} />

          <Grid item xs={12}>
            <Button fullWidth variant="contained" size="large" color="primary" type="submit" disabled={status !== 'ok'}>
              {'Entrar'}
            </Button>
          </Grid>
        </Grid>
        <Grid alignContent="center" alignItems={'center'} maxWidth={'100%'}>
          <Collapse data-tid="loginStatus" in={loginError? true : false} className={classes.loaderWrapper} unmountOnExit>
            <Alert severity={loginError?.type}>{loginError?.message}</Alert>
          </Collapse>
          <Collapse data-tid="loginStatus" in={status === 'loading' && !loginError} className={classes.loaderWrapper} unmountOnExit>
            <CircularProgress aria-label={'Cargando...'} />
          </Collapse>
        </Grid>
      </Container>
    </form>
  </div>
  )
}

export default Login;
