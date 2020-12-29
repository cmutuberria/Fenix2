import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,  Grid,
    Button, IconButton,  Paper, List, ListItem,
    ListItemText,
    ListItemSecondaryAction,
    TextField
} from "@material-ui/core";
import useStyles from '../../../style'
import { useSnackbar } from 'notistack';
import { LOADING_START, LOADING_END, SERVER_ERROR } from "../../../Redux/actionTypes";
import { apiCall } from "../../../Redux/Api";
import { Edit, Delete, ExpandMore, ExpandLess } from '@material-ui/icons';
import { loading } from "../../../Redux/selectors";



export default ({ obj }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [elements, setElements] = useState(obj.referencias);
    const [selectedChild, setSelectedChild] = useState();
    const Loading = useSelector(state => loading(state));
    const { enqueueSnackbar } = useSnackbar();
    const [serverErrors, setServerErrors] = useState()
    const [showForm, setShowForm] = useState(false);



    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});

    const handleChange = event => {
        const { name, value } = event.target;
        setValues({
            ...values,
            [name]: value
        });
    };
    function validateForm() {
        let errors1 = {};
        if (!values.referencia) {
            errors1.referencia = "El nombre es requerido";
        }
        setErrors(errors1);
        return errors1;
    }
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            if (Object.keys(validateForm()).length === 0) {
                dispatch({ type: LOADING_START })
                let referencias = elements
                if (selectedChild) {
                    referencias[referencias.indexOf(selectedChild)] = values.referencia;
                } else {
                    referencias.push(values.referencia)
                }
                let result = null
                result = await apiCall(`/estructura/especie/${obj._id}`, { referencias: referencias }, null, 'PUT')
                if (result) {
                    enqueueSnackbar(result.data.message, { variant: 'success' })
                    setElements(referencias)
                    resetData()
                }
                dispatch({ type: LOADING_END });
            }
        } catch (err) {
            dispatch({ type: LOADING_END });
            if (err.response.data.errors) {
                Object.keys(err.response.data.errors).map((elem) => {
                    errors = {
                        ...errors,
                        [elem]: err.response.data.errors[elem].message
                    }

                })
                setServerErrors(errors);
            } else {
                dispatch({ type: SERVER_ERROR, error: err });
                //history.push("/error")
            }

        }
    }

    const resetData = () => {
        setValues({})
        setErrors({})
        setSelectedChild()
    }

    const handlerDelete = async (item) => {
        try {
            dispatch({ type: LOADING_START })
            let result = null
            const referencias = elements.filter((elem) => elem != item)
            result = await apiCall(`/estructura/especie/${obj._id}`,
                { referencias: referencias }, null, 'PUT')
            if (result) {
                enqueueSnackbar(result.data.message, { variant: 'success' })
                setElements(referencias)
                resetData()
            }
            dispatch({ type: LOADING_END });
        } catch (err) {
            dispatch({ type: LOADING_END });
            dispatch({ type: SERVER_ERROR, error: err });
        }
    }

    const render = () => {
        return <List dense>
            {elements.map((item, i) => <ListItem key={i}>
                <ListItemText primary={item} />
                <ListItemSecondaryAction >
                    <IconButton aria-label="Editar" edge="end"
                        onClick={(e) => {
                            setSelectedChild(item)
                            setValues({ ...values, referencia: item })
                            setShowForm(true)
                        }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="Eliminar" edge="end"
                        onClick={(e) => {
                            handlerDelete(item)
                        }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>)}
        </List>
    }
    return (
        <React.Fragment>
            <div className={classes.detailHeader}>
                <Typography variant="h6">Referencias</Typography>
                {!showForm && <Button endIcon={<ExpandMore />}
                    size="small"
                    onClick={()=>setShowForm(!showForm)}>
                    Mostrar Formulario</Button>}
                {showForm && <Button endIcon={<ExpandLess />}
                    size="small"
                    onClick={()=>setShowForm(!showForm)}>
                    Ocultar Formulario</Button>}
            </div>
            {showForm&&<Grid>
                <form onSubmit={handleSubmit} noValidate className={classes.formInline}>
                    <TextField
                        label="Referencia*"
                        name="referencia"
                        id="referencia"
                        onChange={handleChange}
                        className={classes.autocompleteInline} 
                        value={values.referencia || ''}
                        error={errors.referencia ? true : false}
                        helperText={errors.referencia}
                    />
                    <Button variant="contained" type="submit"
                        color="primary" size="small" disabled={Loading}>Salvar</Button>

                </form>
            </Grid>}
            <Paper variant="outlined">
                {render()}
            </Paper>
        </React.Fragment >
    )
}