const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const {promisify} = require ('util')


// Registrar usuario

exports.register = async(req, res)=>{
    try {
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        //console.log(name + "-" + email + "-" + password)
        let passHash = await bcryptjs.hash(password,8)
        //console.log(passHash)
        conexion.query('INSERT INTO users SET ?',{email:email, name:name, password:passHash},(error, results)=>{
            if(error){console.log(error)}
            res.redirect('/')
        })
    } catch (error) {
        console.log(error)
    }
}

exports.login = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        //console.log(email + "-" + password)

        if(!email || !password){
            res.render('login',{
                alert:true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un email y password",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        }else{
            conexion.query('SELECT * FROM users WHERE email = ?', [email], async(error,results)=>{
                if(results.length == 0 || ! (await bcryptjs.compare(password,results[0].password)) ){
                    res.render('login',{
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o Password incorrectos",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    })
                }else{
                    //Login Correcto
                    const id = results[0].id
                    const token = jwt.sign({id:id},process.env.JWT_SECRETO,{
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    //Tocken sin fecha de expiracion
                    //const token = jwt.sign({id:id},process.env.JWT_SECRETO)
                    //console.log("TOKEN: " + token + "Para el usuaio: " + email)
                    
                    //Cookies
                    const cookiesOptions={
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt',token,cookiesOptions)
                    res.render('login',{
                        alert:true,
                        alertTitle: "Conexion exitosa",
                        alertMessage: "¡LOGIN CORRECTO!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.isauthenticated = async (req,res,next)=>{
    if(req.cookies.jwt){
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT id, name, email FROM users WHERE id = ?',[decodificada.id],(error,results)=>{
                if(error){
                    return res.status(500).send('No se pudo verificar la sesión')
                }
                if(!results.length){
                    res.clearCookie('jwt')
                    return res.redirect('/login')
                }
                req.email = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            res.clearCookie('jwt')
            return res.redirect('/login')
        }
    }else{
        res.redirect('/login')
    }
}

exports.listUsers = (req, res)=>{
    conexion.query('SELECT id, name, email FROM users ORDER BY id', (error, users)=>{
        if(error){
            return res.status(500).send('No se pudieron cargar los usuarios')
        }
        res.render('index', {email:req.email, users, estado:req.query.estado})
    })
}

exports.updateUser = (req, res)=>{
    const id = Number(req.params.id)
    const name = req.body.name && req.body.name.trim()
    const email = req.body.email && req.body.email.trim()

    if(!Number.isSafeInteger(id) || id < 1 || !name || name.length > 100 || !email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.redirect('/?estado=datos-invalidos')
    }

    conexion.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, id], (error, users)=>{
        if(error){
            return res.status(500).send('No se pudo actualizar el usuario')
        }
        if(users.length){
            return res.redirect('/?estado=correo-registrado')
        }

        conexion.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (updateError, result)=>{
            if(updateError){
                return res.status(500).send('No se pudo actualizar el usuario')
            }
            res.redirect(`/?estado=${result.affectedRows ? 'actualizado' : 'no-encontrado'}`)
        })
    })
}

exports.deleteUser = (req, res)=>{
    const id = Number(req.params.id)

    if(!Number.isSafeInteger(id) || id < 1){
        return res.redirect('/?estado=no-encontrado')
    }
    if(id === Number(req.email.id)){
        return res.redirect('/?estado=no-puedes-eliminarte')
    }

    conexion.query('DELETE FROM users WHERE id = ?', [id], (error, result)=>{
        if(error){
            return res.status(500).send('No se pudo eliminar el usuario')
        }
        res.redirect(`/?estado=${result.affectedRows ? 'eliminado' : 'no-encontrado'}`)
    })
}

exports.logout = (req, res)=>{
    res.clearCookie('jwt')
    return res.redirect('/')
}