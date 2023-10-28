const express = require('express');
const mongoose = require("mongoose")
const cors = require('cors');
require('dotenv').config();
const app = express();
const User = require('./models/User.js');
const CookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bcryptSalt = bcrypt.genSaltSync(10);
const imageDownloader = require('image-downloader');
const jwtSecret = 'wijrbwjrbjkwrwerkjb';
const multer = require ('multer');
const fs = require ('fs');
const cookieParser = require('cookie-parser');


app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
  credentials: true,
  origin: 'http://127.0.0.1:5173',
}));


app.get('/test', (req,res)=>{
    res.json('test ok')
});
mongoose.connect(process.env.MONGO_URL);

app.post('/register', async (req,res) => {
    const {name,email,password} = req.body;
    try{
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
    
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign(
                {
                    email: userDoc.email,
                    id: userDoc._id,
                },jwtSecret,{},(err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json(userDoc);
                }
            );
        } else {
            res.status(401).json('incorrect password');
        }
    } else {
        res.status(404).json('user not found');
    }
});

app.get('/profile',(req,res) => {
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const {name, email, _id} = await User.findById(userData.id);
            res.json({name, email, _id});
        })
    }else {
        res.json(null)
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
});




app.post('/api/upload-by-link', async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: '/tmp/' +newName,
    });
    const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
    res.json(url);
  });

const photosMiddleware = multer({dest:'uploads/'});
app.post('/upload', photosMiddleware.array('photos', 100), (req,res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const {path,originalname} = req.files[i];
        const parts = originalname.split ('.');
        const ext = parts[parts.length -1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads/',''));
    }
    res.json(uploadedFiles);
});


app.listen(4000);
//2A8P11J4SVDPNV2L