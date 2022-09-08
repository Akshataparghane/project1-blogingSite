const express = require('express');
const router = express.Router();
const AuthorController= require('../controllers/authorController')
const BlogController= require('../controllers/blogController')
const {authentication , authorisation} = require('../middlewares/middleware')


router.post('/authors', AuthorController.createAuthor)
router.post("/blogs", authentication, BlogController.createBlog)
router.get('/blogs', authentication, BlogController.getBlogs)
router.put('/blogs/:blogId', authentication, authorisation, BlogController.updateBlogs)
router.delete('/blogs/:blogId', authentication, authorisation, BlogController.deleteBlogsById)
router.delete('/blogs', authentication,BlogController.deleteBlogs)
router.post('/login', AuthorController.loginUser)


module.exports = router