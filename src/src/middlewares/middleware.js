const jwt = require('jsonwebtoken')
const blogModel = require('../models/blogModel')
const mongoose=require('mongoose')
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-Api-Key"]
        if (!(token)){
            token = req.headers["x-api-key"]
        } 
        if (!(token)) {
            return res.status(401).send({ status: false, msg: "Token must enter token" })
        }
        let decodedtoken = jwt.verify(token, "projectgroup20-key")
        if (!(decodedtoken)) return res.status(401).send({ status: false, msg: "Invalid Token" })
        req.decodedToken = decodedtoken
        res.setHeader("x-api-key", token)
        
        next()
    }
    catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }
}



const authorisation = async function (req, res, next) {
    try {
        let decoded = req.decodedToken
        let paramsBlogId = req.params.blogId
        if (!isValidObjectId(paramsBlogId))  return res.status(400).send({ status: false,msg: "please enter valid blogId" })
        let userLoggedIn = decoded.authorId
        let blog = await blogModel.findById(paramsBlogId)
        if(!blog){
            return res.status(404).send({status: false, msg: "Blog not Found"})
        }
        const blogAuthorId = (blog.authorId).toString()
        if(blogAuthorId !== userLoggedIn)
        {
            return res.status(403).send({status: false, msg: "You are not authorised Person"})
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports.authentication = authentication
module.exports.authorisation = authorisation