import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Card, CardContent, CardActions, Button,
    TextField, Typography, IconButton, Grid
} from "@material-ui/core";
import Undo from '@material-ui/icons/Undo'
import useStyles from "../../../style";
import useForm from '../../../useForm';
import { useSnackbar } from 'notistack';
import { apiCall } from '../../../Redux/Api';
import { LOADING_START, LOADING_END, SERVER_ERROR } from "../../../Redux/actionTypes";
import { loading } from "../../../Redux/selectors";
import Autocomplete from '@material-ui/lab/Autocomplete';
import CategoriaUICN from '../../../Constant/CategoriaUICN';


export default ({ match, history }) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const id = match.params.id;
    const [obj, setObj] = useState();
    const [clasificadores, setClasificadores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [padres, setPadres] = useState([]);
    const [serverErrors, setServerErrors] = useState()
    const { enqueueSnackbar } = useSnackbar();
    const Loading = useSelector(state => loading(state));


    let { handleChange, handleSubmit, values, errors, handleSelect } = useForm(
        submit,
        validateForm,
        id ? obj : null,
        serverErrors ? serverErrors : null
    );
    const loadObj = async (id) => {
        try {
            dispatch({ type: LOADING_START })
            const result = await apiCall(`/especie/${id}`, null, null, 'GET')
            const objResp = result.data.obj
            setObj({
                _id:objResp._id,
                tipo: objResp.estructura.tipo,
                padre: objResp.estructura.padre,
                estructura: objResp.estructura,
                nombre: objResp.nombre,
                categoria_UICN: CategoriaUICN.find(elem => elem._id == objResp.categoria_UICN),
                clasificador: objResp.clasificador,
                origen: objResp.origen,
                anno_clasificacion: objResp.anno_clasificacion,
            });
           /*  setObj({
                ...objResp,
                tipo: objResp.estructura.tipo,
                padre: objResp.estructura.padre,
                categoria_UICN: CategoriaUICN.find(elem => elem._id == objResp.categoria_UICN),
            }); */
            dispatch({ type: LOADING_END });
        } catch (err) {
            dispatch({ type: LOADING_END });
            dispatch({ type: SERVER_ERROR, error: err });
            history.push("/error")
        }
    };
    useEffect(() => {
        loadTipoEspecie()
        loadClasificadores()
        loadCategorias()
        if (id) {
            loadObj(id)
        }
    }, [])
    useEffect(() => {
        if (values.tipo) {
            loadParentCandidates()
        }
    }, [values.tipo])
    const loadTipoEspecie = async () => {
        try {
            dispatch({ type: LOADING_START });
            const result = await apiCall(`/tipoEstructura/especie`, null, null, 'GET');
            handleSelect("tipo", result.data.obj);
            dispatch({ type: LOADING_END });
        } catch (err) {
            dispatch({ type: LOADING_END });
            dispatch({ type: SERVER_ERROR, error: err });
            history.push("/error")
        }
    };
    const loadClasificadores = async () => {
        try {
            dispatch({ type: LOADING_START });
            const result = await apiCall(`/colector/all`, null, null, 'GET');
            setClasificadores(result.data.all)
            dispatch({ type: LOADING_END });
        } catch (err) {
            dispatch({ type: LOADING_END });
            dispatch({ type: SERVER_ERROR, error: err });
            history.push("/error")
        }
    };
    const loadParentCandidates = async () => {
        try {
            dispatch({ type: LOADING_START });
            const result = await apiCall(`/estructura/ParentCandidates?tipo=${values.tipo._id}`, null, null, 'GET');
            console.log(result.data);
            setPadres(result.data);
            dispatch({ type: LOADING_END });
        } catch (err) {
            dispatch({ type: LOADING_END });
            dispatch({ type: SERVER_ERROR, error: err });
            history.push("/error")
        }
    };
    const loadCategorias = async () => {
        try {
            dispatch({ type: LOADING_START });
            const result = await apiCall(`/categoria-uicn/`, null, null, 'GET');
            setCategorias(result.data);
            dispatch({ type: LOADING_END });
        } catch (err) {
            dispatch({ type: LOADING_END });
            dispatch({ type: SERVER_ERROR, error: err });
            history.push("/error")
        }
    };

    function validateForm(values) {
        let errors = {};
        if (!values.padre) {
            errors.padre = "El padre es requerido";
        }
        if (!values.nombre) {
            errors.nombre = "El nombre es requerido";
        }
        if (!values.categoria_UICN) {
            errors.nombre = "La categoría de amenaza UICN es requerida";
        }
        return errors;
    }
    async function submit() {
        try {
            dispatch({ type: LOADING_START })
            const objSubmit = {
                ...values,
                categoria_UICN: values.categoria_UICN._id,
            };
            let result = null
            if (id) { 
                console.log(objSubmit);               
                result = await apiCall(`/especie/edit/${id}`, objSubmit, null, 'PUT')
            } else {
                result = await apiCall(`/especie`, objSubmit, null, 'POST')
            }
            if (result) {
                enqueueSnackbar(result.data.message, { variant: 'success' })
                history.goBack()
            }
            dispatch({ type: LOADING_END });
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
                history.push("/error")
            }

        }
    }

    const resetData = () => {
        loadObj(id);
    }

    return (
        <div className={classes.rootForm}>
            <div>
                <Typography variant="h3" className={classes.header}>Formulario de Especie</Typography>
                <Card>
                    <form onSubmit={handleSubmit} noValidate>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    {padres && padres.length > 0 && <Autocomplete
                                        autoComplete
                                        options={padres}
                                        getOptionLabel={option => option.nombre + " - " + option.tipo.label}
                                        id="padre"
                                        name="padre"
                                        value={values.padre || null}
                                        onChange={(event, newValue) => {
                                            handleSelect("padre", newValue)
                                        }}
                                        renderInput={params => (
                                            <TextField {...params} label="Padre*"
                                                className={classes.textField}
                                                error={errors.padre ? true : false}
                                                helperText={errors.padre} />
                                        )}
                                    />}
                                    <TextField
                                        className={classes.textField}
                                        label="Nombre Científico*"
                                        name="nombre"
                                        id="nombre"
                                        onChange={handleChange}
                                        value={values.nombre || ''}
                                        error={errors.nombre ? true : false}
                                        helperText={errors.nombre}
                                    />
                                    {categorias && categorias.length > 0 && <Autocomplete
                                        autoComplete
                                        options={categorias}
                                        getOptionLabel={option => option.label}
                                        id="categoria_UICN"
                                        name="categoria_UICN"
                                        value={values.categoria_UICN || null}
                                        onChange={(event, newValue) => {
                                            handleSelect("categoria_UICN", newValue)
                                        }}
                                        renderInput={params => (
                                            <TextField {...params} label="Categoría Amenaza UICN*"
                                                className={classes.textField}
                                                error={errors.categoria_UICN ? true : false}
                                                helperText={errors.categoria_UICN} />
                                        )}
                                    />}
                                </Grid>
                                <Grid item xs={6}>
                                    {clasificadores && clasificadores.length > 0 && <Autocomplete
                                        autoComplete
                                        options={clasificadores}
                                        getOptionLabel={option => option.nombre}
                                        id="clasificador"
                                        name="clasificador"
                                        value={values.clasificador || null}
                                        onChange={(event, newValue) => {
                                            handleSelect("clasificador", newValue)
                                        }}
                                        renderInput={params => (
                                            <TextField {...params} label="Clasificador"
                                                className={classes.textField}
                                                error={errors.clasificador ? true : false}
                                                helperText={errors.clasificador} />
                                        )}
                                    />}

                                    <TextField
                                        type="numeric"
                                        className={classes.textField}
                                        label="Año Clasificación"
                                        name="anno_clasificacion"
                                        id="anno_clasificacion"
                                        onChange={handleChange}
                                        value={values.anno_clasificacion || ''}
                                        error={errors.anno_clasificacion ? true : false}
                                        helperText={errors.anno_clasificacion}
                                    />
                                    <TextField
                                        className={classes.textField}
                                        label="Origen"
                                        name="origen"
                                        id="origen"
                                        onChange={handleChange}
                                        value={values.origen || ''}
                                        error={errors.origen ? true : false}
                                        helperText={errors.origen}
                                    />
                                </Grid>
                            </Grid>
                            {/* tipos && tipos.length > 0 && <Autocomplete
                                autoComplete
                                options={tipos}
                                getOptionLabel={option => option.label}
                                id="tipo"
                                name="tipo"
                                value={values.tipo || null}
                                onChange={(event, newValue) => {
                                    handleSelect("tipo", newValue)
                                }}
                                renderInput={params => (
                                    <TextField {...params} label="Tipo*"
                                        className={classes.textField}
                                        error={errors.tipo ? true : false}
                                        helperText={errors.tipo} />
                                )}
                            /> */}
                        </CardContent>
                        <CardActions className={classes.actions}>
                            {id && <IconButton onClick={resetData} disabled={Loading}><Undo /></IconButton>}
                            <Button variant="contained" type="submit" color="primary" disabled={Loading}>Salvar</Button>
                        </CardActions>
                    </form>
                </Card>
            </div>
        </div>

    )
}