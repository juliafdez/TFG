"use strict";


/**
 * Proporciona operaciones para la gestión de profesores
 * en la base de datos.
 */
class DAOTeachers {
    /**
     * Inicializa el DAO de profesores.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} user Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(user, password, callback) {
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(err);
            }
            else{
                //Poner bien los campos acordes con las columnas de la bd
            connection.query("SELECT user, password FROM teachers WHERE user = ? and password = ?",
            [user, password],
            (err, rows) => {
            if (err) { callback(err); }
            if (rows.length === 0) {
                callback(null, false);
            } else {
                callback(null, true);
            }
            });
        }
        connection.release();
        });
        
    }
    isDepartmentTeacher(user,callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
            callback(err);
        }else{
            connection.query("SELECT user FROM teachers WHERE user = ? and department = true", [user],
        (err,rows)=>{
            if(err){callback(err);}
            if(rows.length===0){
                callback(null,false);
            }else{
                callback(null,true);
            }
            });
        }
        connection.release();
        });
    }
}

module.exports = {
    DAOTeachers: DAOTeachers
}