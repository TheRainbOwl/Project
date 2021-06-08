// Importa librerias
const { response } = require('express')
const express = require('express') // Modulos de express
const app = express() // Para usar todo lo de express
const {Client} = require('pg') // Modulos para usar postgres
const path = require('path');
const favicon = require('serve-favicon');
const { execPath } = require('process');

// Para pedir datos mas simple.
app.use(express.urlencoded({extended: false}));
/*
     _______.___________.    ___   .___________. __    ______ 
    /       |           |   /   \  |           ||  |  /      |
   |   (----`---|  |----`  /  ^  \ `---|  |----`|  | |  ,----'
    \   \       |  |      /  /_\  \    |  |     |  | |  |     
.----)   |      |  |     /  _____  \   |  |     |  | |  `----.
|_______/       |__|    /__/     \__\  |__|     |__|  \______|
                                                              
*/
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')))
app.use(express.static('public/img'))
app.use(express.static('public/css'))
app.use(express.static('public/js'))
const PORT = 3000;

/*
 _______  .______   
|       \ |   _  \  
|  .--.  ||  |_)  | 
|  |  |  ||   _  <  
|  '--'  ||  |_)  | 
|_______/ |______/  
                    
*/

const data = {
    user: "postgres",
    password: "123",
    database: "hospital",
    host: "",
    port: 5432
}
const admin = new Client(data) // Se crea un usuario con los datos de la BD
const medicos = new Client(data)
const cita = new Client(data)
const pacientes = new Client(data)

let adminData;
admin.connect() // Se conecta a la BD
admin.query("SELECT * FROM administrador", (err, result) =>{
    if(err){
        response.status(404).end()
    }
    adminData = result.rows
    admin.end()
})

let dataMedicos;
let sizeMedicos;
medicos.connect()
medicos.query("SELECT * FROM medicos", (err, result) =>{
    if(err){
        response.status(404).end()
    }
    dataMedicos = result.rows
    sizeMedicos = result.rowCount
    medicos.end()
})

let dataPacientes;
let sizePacientes;
pacientes.connect()
pacientes.query('SELECT * FROM paciente', (err,result) =>{
    if(err){
        response.status(404).end()
    }
    dataPacientes = result.rows
    sizePacientes = result.rowCount
    pacientes.end()
})


/*
  _______  _______ .___________.    _______.
 /  _____||   ____||           |   /       |
|  |  __  |  |__   `---|  |----`  |   (----`
|  | |_ | |   __|      |  |        \   \    
|  |__| | |  |____     |  |    .----)   |   
 \______| |_______|    |__|    |_______/    
                                            
*/
app.get('/', (req, res) =>{
    res.render('index.ejs', { root: __dirname, adminD : adminData, dataM: dataMedicos})
})

app.get('/principal', (req, res) =>{
    res.render('principal.ejs', {root: __dirname})
})

app.get('/citas', (req, res) =>{
    res.render('citas.ejs', {root: __dirname, dataMedico: dataMedicos})
})

app.get('/alta_doctor', (req, res) =>{
    res.render('alta_doctor.ejs', {root: __dirname})
})

app.get('/alta_paciente', (req, res) =>{
    res.render('alta_paciente.ejs', {root: __dirname})
})

app.get('/medico', (req, res) =>{
    res.render('principalMedico.ejs', { root: __dirname})
})
/*
.______     ______        _______.___________.
|   _  \   /  __  \      /       |           |
|  |_)  | |  |  |  |    |   (----`---|  |----`
|   ___/  |  |  |  |     \   \       |  |     
|  |      |  `--'  | .----)   |      |  |     
| _|       \______/  |_______/       |__|                                                   

*/
app.post('/login', (req, res) =>{
    
    const user = req.body.usuario
    const pass = req.body.contrasenia
    if(user === adminData[0].nombre && pass == adminData[0].contrasenia){
        
        res.render('principal.ejs', { root: __dirname})

    }else{
        
        for(let i = 0; i < sizeMedicos; i++){
            if(user === dataMedicos[i].usuario && pass == dataMedicos[i].contrasenia){
                res.render('principalMedico.ejs', { root: __dirname}) 
            }
        }

        for(let i = 0; i < sizePacientes; i++){
            if(user === dataPacientes[i].nombre && pass == dataPacientes[i].contrasenia){
                res.render('principalPaciente.ejs', { root: __dirname})
            }
        }
        
        
    }
    res.render('index.ejs', { root: __dirname})

})
cita.connect()
app.post('/send-cita-form', (req, res) =>{
    console.log(req.body)
    const {usuario, day, hour, selectionDoctor} = req.body
    cita.query('INSERT INTO cita VALUES($1, $2, $3, $4)',[usuario, day, hour, selectionDoctor] ,(err, response) =>{
        if(err){
            return console.error('connexion error', err);
        } 
    })
    res.render('citas.ejs', {root: __dirname, dataMedico: dataMedicos})
})

app.post('/send-doctor-form', (req, res) =>{
    console.log(req.body)
    const {name, apellido1, apellido2, curp, nss, sexo, direction, nacimiento, ingreso, user, password, especialidades} = req.body
    prueba.query('INSERT INTO medicos VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [name, apellido1, apellido2, curp, nss, sexo, direction, nacimiento, ingreso, user, password, '09:00',especialidades], (err, response) =>{
        if(err){
            return console.error('connexion error', err);
        }
    })
    res.render('alta_doctor.ejs', {root: __dirname})
})

app.post('/send-pacient-form', (req, res) =>{
    console.log(req.body)
    const {name, apellido1, apellido2, curp, nss, sexo, direction, nacimiento, telefono, user, password} = req.body
    prueba.query('INSERT INTO paciente VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [name, apellido1, apellido2, nss, curp, direction, user, password, sexo, nacimiento, telefono], (err, response) =>{
        if(err){
            return console.log('conexion error', err)
        }    
    })
    res.render('alta_paciente.ejs', {root: __dirname})
})

app.listen(PORT, () =>{
    console.log(`Escuchando en el puerto http://localhost:${PORT}`)
})