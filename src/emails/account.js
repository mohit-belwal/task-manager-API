const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
})

    
const transporterObject = transporter()
    
const sendWelcomeEmail= (email, name)=>{
    console.log(email)
    
    transporterObject.sendMail({
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: 'Welcome to our service',
        text: `Hello ${name}.`,
        html:'<b>Thanks for joining</b>'
})
}
    
// sendWelcomeEmail('abc@example.com', 'andrew')
    
const sendDeleteEmail= (email, name)=>{
    transporterObject.sendMail({
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: `Goodbye ${name}`,
        text: `Thanks for considering us, ${name}.`,
        html:'<b>We hope to see you soon</b>'
    })
}

module.exports ={
    sendWelcomeEmail,
    sendDeleteEmail
}