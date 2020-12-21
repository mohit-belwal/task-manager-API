const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendDeleteEmail} = require('../emails/account')
const sharp = require('sharp')
const router = new express.Router()


router.post('/users', async (req, res)=>{
    const user = new User(req.body)

    try {
        // sendWelcomeEmail(user.email, user.name)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send({error: 'Email or/and password is incorrect'})
    }
})

router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token         //token is a object with "_id" & "token" property
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res)=>{
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('Invalid Updates!')
    }

    try {
        //const user = await User.findByIdAndUpdate(id, req.body, {new: true, runValidators: true})
        //with above function userSchema.pre function wont run, hence another function below for the same task
        updates.forEach((update) => req.user[update] = req.body[update] )
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res)=>{
    try {
        await req.user.remove()
        // sendDeleteEmail(req.user.email, req.user.name)
        console.log(req.user)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){      //if(!file.originalname.endWith('jpg')
            return cb(new Error('Please upload document in jpg, jpeg or png format'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('Not Found')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router