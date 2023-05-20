if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config() 
}

const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const { food, transaction, sequelize } = require('./models')
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const errorHandler = require('./helpers/errHandler')

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    // Generate a unique filename or use the original file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = uniqueSuffix + '-' + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

app.get('/foodlist', async (req, res, next) => {
    try {
        const data = await food.findAll()
        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
})

app.get('/transactionlist', async (req, res, next) => {
    try {
        const data = await transaction.findAll()
        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
})

app.delete('/clear-cart', async (req, res, next) => {
    try {
        const data = await transaction.destroy({ truncate: true })
        res.status(200).json(data)
    } catch (err) {
        console.log(err)
    }
})

app.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params; // Get the filename parameter from the request URL
    const imagePath = path.join(__dirname, 'uploads', filename); // Construct the full path to the image file

    res.sendFile(imagePath); // Send the file as a response
});

app.post('/addmenu', upload.single('foto'), async (req, res, next) => {
    const {nama, harga} = req.body
    // console.log(req.body, '<<<<<');
    try{
        const createProduct = await food.create({
            nama: req.body.nama,
            foto: req.file ? `https://dramatic-carpenter-production.up.railway.app/uploads/${req.file.filename}` : '', 
            harga: req.body.harga
        },{returning: true})        
        res.status(201).json(createProduct)
        // console.log(createProduct, "<<<<<<<<||||||?")
    } catch (err){
        // console.log(err);
        next(err)
    }
})

app.get('/productbyid/:id', async (req, res, next) => {
    const {id} = req.params

    try {
        const getProductById = await food.findByPk(id)
        if(getProductById){
            res.status(200).json(getProductById)
        }else{
            throw {name: 'WrongId'}
        }
    } catch (err) {
        next(err)
    }
})

app.post('/transactions/:id', async (req, res, next) => {
    const {id} = req.params    

    try {
        let product = await food.findByPk(id)
        // console.log(product.dataValues.nama, "<<<!!!!")
        if(!product){
            throw {name: 'WrongId'}
        }        
        const [trans, created] = await transaction.findOrCreate({
            where: {prodId: id},
            default: {     
                harga_x_amount: product.dataValues.harga_x_amount,           
                amount: 0
            },
        })
        if(created){
            trans.prodId = product.dataValues.id
            trans.harga_x_amount =  trans.harga_x_amount + product.dataValues.harga_x_amount 
        }

        trans.nama = product.dataValues.nama
        trans.foto = product.dataValues.foto
        trans.amount += 1
        trans.harga_x_amount = product.dataValues.harga * trans.amount
        trans.harga = product.dataValues.harga
        await trans.save()
        res.status(201).json(trans)
    } catch (err) {
        next(err)
    }
})

app.use(errorHandler)
// console.log(process.env.DATABASE_URL)
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))