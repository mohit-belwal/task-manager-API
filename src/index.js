const express = require('express')
require('./db/mongoose.js')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

// app.use((req, res, next)=>{
//     res.status(503).send('Site is under maintainance')
// })

app.use(express.json())     //from JSON to object ; much like JSON.parse()
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log('Server is up on '+ port)
})