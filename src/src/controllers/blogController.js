const BlogModel = require('../models/blogModel')
const AuthorModel = require('../models/authorModel')
const { default: mongoose } = require('mongoose')
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
const stringChecking = function (data) {
    if (typeof data !== 'string') {
      return false;
    } else if (typeof data === 'string' && data.trim().length == 0) {
      return false;
    } else {
      return true;
    }
  }

  const arrayOfStringChecking = function (data) { for(let i=0;i<data.length;i++){
    if (typeof data[i] !== 'string') {
      return false;
    } else if (typeof data[i] === 'string' && data[i].trim().length == 0) {
      return false;
    } else {
      return true;
    }
  }
}
//---------------------------------------------------------Blog PostApi-----------------------------------------------------------
const createBlog = async function (req, res) {
    try {
        let data = req.body
        let title = data.title
        let body = data.body
        let authorId = data.authorId
        let category = data.category
        let tags=data.tags
        let subcategory = data.subcategory
        if (Object.keys(data).length === 0){
            return res.status(400).send({ status: false, msg: "Please enter Blog details" })
        }
        if (!isValidObjectId(authorId)) {
            return res.status(400).send({ msg: "please enter valid authorId" })
        }
        if(!stringChecking(title) || !stringChecking(body)) return res.status(400).send({ status: false, msg: "title and body must be present and have Non empty string " }) 

                
        if(!arrayOfStringChecking(category) ) return res.status(400).send({ status: false, msg: "category must be present and have Non empty string " }) 

        if(subcategory){
            if(!arrayOfStringChecking(subcategory) ) return res.status(400).send({ status: false, msg: "subcategory must be present and have Non empty string " }) 
        }
        if( tags){
            if( !arrayOfStringChecking(tags) ) return res.status(400).send({ status: false, msg: "tags must be present and have Non empty string " }) 
        }

        let findid = await AuthorModel.findById(authorId)
        if (!(findid)){
            return res.status(404).send({ status: false, msg: "Invalid authorId. Author Not Found " })
        } 
        let savedData = await BlogModel.create(data)
        return res.status(201).send({ status: true, data: savedData })
    }
    catch (err) {
        console.log("The error is ==>", err)
        return res.status(500).send({ status: false, error: err.message })
    }
}

//--------------------------------------------------------GET BLOGS-----------------------------------------------------------------

const getBlogs = async function (req, res) {
    try {
        let bodyData = req.query
        
        if (Object.keys(bodyData).length==0){
            let getData = await BlogModel.find({ isDeleted: false, isPublished: true })
            if (getData.length <= 0) {
                 res.status(404).send({ status: false, msg: "Data Not Found" })
                }
               res.status(200).send({ status: true,count:getData.length, data: getData })
        }            
        else{    
            let {subcategory,category,tags,authorId}=bodyData
            let filter={}
            if(subcategory){
                if(!arrayOfStringChecking(subcategory) ) return res.status(404).send({ status: false, msg: "subcategory must be present and have Non empty string " })
                filter.subcategory= subcategory
            }
            if( tags){
                if( !arrayOfStringChecking(tags) ) return res.status(404).send({ status: false, msg: "tags must be present and have Non empty string " }) 
                filter.tags=tags
            }
            if( category){
                if( !arrayOfStringChecking(tags) ) return res.status(404).send({ status: false, msg: "tags must be present and have Non empty string " }) 
                filter.category=category
            }
            if(authorId){
            if (!isValidObjectId(authorId))  return res.status(400).send({ status: false,msg: "please enter valid authorId" })
                filter.authorId=authorId
            }
            filter.isDeleted=false
            filter.isPublished=true
           if(subcategory || category || tags || authorId){
            let getDataByFilter = await BlogModel.find(filter)
            return res.status(200).send({ status: true, count:getDataByFilter.length,data: getDataByFilter} ) 
           } 
           else{
            return res.status(400).send({status: false, msg: "Filters can be subcategory,category,tags,authorId only " })
           }
        }
      }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

//--------------------------------------------------------UPDATE BLOGS---------------------------------------------------------------

const updateBlogs = async function (req, res) {
    try {
        let blogId = req.params.blogId
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, msg: "Please enter valid blogId in params" })
        } else {
            let check = await BlogModel.findById(blogId).select({ isDeleted: 1, _id: 0 })
            if (check.isDeleted == true) { return res.status(404).send({ status: false, msg: "Blog not found" }) }
            let data = req.body
            if(Object.keys(data).length===0){
                return res.status(400).send({status:false,msg:"Please enter required details in request body"})
            }else {
                let {subcategory,tags,body,title}=data
                if(subcategory){
                    if(!arrayOfStringChecking(subcategory) ) return res.status(400).send({ status: false, msg: "subcategory must  have Non empty string " }) 
                }
                if( tags){
                    if( !arrayOfStringChecking(tags) ) return res.status(400).send({ status: false, msg: "tags must have Non empty string " }) 
                }
        
                if(title){
                      if(!stringChecking(title)) return res.status(400).send({ status: false, msg: "title must be Non empty string " })
                } 
        
                if(body){
                      if(!stringChecking(body)) return res.status(400).send({ status: false, msg: "body must have Non empty string " }) 
                }
                     let allBooks = await BlogModel.findByIdAndUpdate(
                    { _id: blogId },
                    [{ $set: data }, { $set: { isPublished: true, publishedAt: Date.now() } }],
                    { new: true }
                )
                return res.status(200).send({ status: true, msg: allBooks })
            }
        }
    } catch (err) {
        console.log("The error is ==>", err)
        return res.status(500).send({ status: false, error: err.message })
    }
}

//--------------------------------------------------------DELETE BLOGS BY ID----------------------------------------------------------

const deleteBlogsById = async function (req, res) {
    try {
        let blogId = req.params.blogId
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, msg: "PLEASE PROVIDE A VALID BLOG ID" })
        } else {
            let check = await BlogModel.findById(blogId).select({ isDeleted: 1, _id: 0 })
            if (check.isDeleted == true) { return res.status(404).send({ status: false, msg: "Already deleted" }) }
            let deleteblogs = await BlogModel.findByIdAndUpdate(
                { _id: blogId },
                { $set: { isDeleted: true, deletedAt: Date.now() } },
            )
            console.log(deleteblogs)
            return res.status(200).send({ msg: "Blog deleted successful", status: true })
        }
    }
    catch (err) {
        console.log("The error is ==>", err)
        return res.status(500).send({ status: false, error: err.message })
    }
}

//--------------------------------------------------------DELETE BLOGS--------------------------------------------------------------

const deleteBlogs = async function (req, res) {
    try {
        let data = req.query
        if (Object.keys(data).length === 0) {
            res.status(400).send({ status: false, msg: "No filter found to delete blogs" })
        } else {
            const tokenAuthorId=(req.decodedToken.authorId).toString()
        
        const {category,subcategory,tags,authorId}=data
        const filter={}
        if(subcategory){
            if(!arrayOfStringChecking(subcategory) ) return res.status(404).send({ status: false, msg: "subcategory must be present and have Non empty string " })
            filter.subcategory= subcategory
        }
        if( tags){
            if( !arrayOfStringChecking(tags) ) return res.status(404).send({ status: false, msg: "tags must be present and have Non empty string " }) 
            filter.tags=tags
        }
        if( category){
            if( !arrayOfStringChecking(tags) ) return res.status(404).send({ status: false, msg: "tags must be present and have Non empty string " }) 
            filter.category=category
        }
        if(authorId){
            if (!isValidObjectId(authorId))  return res.status(400).send({ status: false,msg: "please enter valid authorId" })
            if(authorId!==tokenAuthorId){
                return res.status(403).send({status:false,msg:"Person is not authorised"})
            }
        }
        filter.isDeleted=false
        filter.isPublished=false

        /////authorization///
        const blog = await BlogModel.find(filter)
        for(let i=0;i<blog.length;i++){          
         console.log(blog[i].authorId ,tokenAuthorId)
        if(((blog[i].authorId).toString())!==tokenAuthorId){
            return res.status(403).send({status:false ,msg:"The blogs with this filters are forbidden for this logged in user"})  
        }
        }
            let blogsDeleted = await BlogModel.updateMany(
                { filter },
                { $set: { isDeleted: true, deletedAt: Date.now() } }
            )
            console.log(blogsDeleted)
            if (blogsDeleted.modifiedCount === 0) {
                return res.status(400).send({ status: false, msg: "No data found" })
            }
            return res.status(200).send({ status: true, msg: "Blogs deleted successfully" })
        }
    } catch (err) {
        console.log("The error is ==>", err)
        return res.status(500).send({ status: false, error: err.message })
    }
}

//--------------------------------------------------------EXPORTS-------------------------------------------------------------------


module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlogs = updateBlogs
module.exports.deleteBlogsById = deleteBlogsById
module.exports.deleteBlogs = deleteBlogs

//-----------------------------------------------------------END-------------------------------------------------------------------
