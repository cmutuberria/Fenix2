import React from "react";
import { Typography, Paper } from "@material-ui/core";
import useStyles from '../style'


export default () => {
    const classes = useStyles();
    
    return (
        <Paper className={classes.errorMsg} key="paper">
                <Typography variant="h1" color="error">404</Typography>
                <Typography variant="h4" color="error">Error del Servidor...</Typography>
        </Paper>
    )
}