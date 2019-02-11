
"use strict";
const express = require("express");
const app = express();
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");
const mysql =require("mysql");
const daoTeachers = require("./dao_teachers");
//const daoAsks = require("./dao_ask");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const expressvalidator = require("express-validator");

const mySQLStore = mysqlSession(session);
const sessionStore = new mySQLStore({
    host:config.mysqlconfig.dbHost,
    user:config.mysqlconfig.dbUser,
    password:config.mysqlconfig.dbPassword,
    database:config.mysqlconfig.dbName
});

const middlewareSession = session({
    saveUninitialized:false,
    secret:"agatajulianacho",
    resave:false,
    store: sessionStore
})

app.use(middlewareSession);
/*app.use(expressvalidator({
    customValidators: {        
        fechaValida: fecha=>{
            return daoUser.edad(fecha)>0;
        },
        opcionesRespuesta: respuestas=>{
            return respuestas.split("\n").filter(elem => elem.length > 0 && elem.trim()).length>1;
            
        }

    }
}));*/
let pool = mysql.createPool({
    host:config.mysqlconfig.dbHost,
    user:config.mysqlconfig.dbUser,
    password:config.mysqlconfig.dbPassword,
    database:config.mysqlconfig.dbName
});

let daoTeacher = new daoTeachers.DAOTeachers(pool);
//let daoAsk = new daoAsks.DAOAsk(pool);

const ficherosEstaticos =path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));
app.set("view engine" , "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended:false}));


/*Página de inicio */
app.get("/", (request,response)=>{
    response.redirect("/practica1.html"/*/Examenes.html*/);
});

/*Inicio sesion*/
app.post("/EntrarUsu.html", (request, response)=>{
    daoTeacher.isUserCorrect(request.body.user, request.body.password, (error,exito)=>{
        if(error){ let mensajeError= error.message;
        response.render("Entrar", {mensajeError:mensajeError});
        }else{
            if(!exito){
                response.render("Entrar", {mensajeError:"Usuario y/o contraseña no validos"});
            }else{
                daoTeacher.isDepartmentTeacher(request.body.user, (error,exito)=>{
                    if(error){let mensajeError=error.message;
                    response.render("Entrar", {mensajeError:mensajeError});
                    }else{
                        request.session.currentUser= request.body.user;
                        request.session.puntos = 0;
                        response.redirect("/Perfil.html"/*/Aulas.html*/);
                    }
                });                
            }
        }
    });
});

app.get("/Entrar.html", (request, response) => {
    response.render("Entrar", {mensajeError:undefined});

});

app.get("/Perfil.html"/*/Aulas.html*/, (request,response)=>{
    daoUser.getAllDatas(request.session.currentUser, (error,datos)=>{
        request.session.puntos = datos.puntos;
        datos.fecha = Number(daoUser.edad(datos.fecha));
        if(!error){
            response.render("Perfil", {datos:datos, puntos:request.session.puntos, currentUser:request.session.currentUser});
        }
        else{
            console.log(error);
            response.end();
        }
    });
});

app.get("/Desconectar.html", (request,response)=>{
    request.session.destroy();
    response.redirect("/Entrar.html");
});

app.listen(config.port, function(err){
    if(err){
        console.log("No se ha podido iniciar el servidor");
        console.log(err);
    }
    else{
        console.log(`Servidor escuchando en puerto ${config.port}`);
    }
});