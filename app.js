const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const { food, transaction } = require('./models')
const errorHandler = require('./helpers/errHandler')

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/foodlist', async (req, res, next) => {
    try {
        const data = await food.findAll()
        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
})
app.post('/transactions/:foodId', async (req, res, next) => {
    const {foodId} = req.params    
    try {
        const data = await transaction.create({
            id: foodId,
        })
        res.status(201).json(data)
    } catch (err) {
        next(err)
    }
})
// app.post('/myheroes/:heroId', async (req, res, next) => {
//     const {heroId} = req.params
//     const userId = req.user.id
//     try {
//         const data = await MyHero.create({
//             HeroId: heroId,
//             UserId: userId
//         })
//         res.status(201).json(data)
//     } catch (err) {
//         next(err)
//     }
// })
// app.get('/myheroes', async (req, res, next) => {
//     try {        
//         const data = await MyHero.findAll({
//             include: {
//                 all: true
//             }
//         })
//         res.status(200).json(data)
//     } catch (err) {
//         next(err)
//     }
// })
// app.patch('/myheroes/:id', async (req, res, next) => {
//     try {
//         const {id} = req.params
//         const userId = req.user.id
//         const data = await MyHero.findAll()
//         const foundHero = await MyHero.findByPk(id)
//         if(!foundHero){
//             throw {name: 'Not Found'}
//         }
//         if(foundHero.UserId !== userId){
//             throw {name: 'Forbidden'}
//         }

//         await MyHero.update(
//             {status: 'Played'},
//             {where: {
//                 status: 'Unplayed',
//                 id
//             }}
//         )
//         res.status(200).json({message: 'Hero has been played'})
//     } catch (err) {
//         next(err)
//     }
// }) 

app.use(errorHandler)
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))