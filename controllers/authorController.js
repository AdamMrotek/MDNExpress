var Author = require('../models/author');
var Book = require('../models/book');
const { body,validationResult } = require('express-validator');
// Display list of all Authors.
exports.author_list = function(req, res) {
Author.find()
.sort({family_name:1})
.then(results =>{
    res.render("author_list",{title:"Author List",author_list:results})
}).catch(err=>{
   res.send(err)})

};

// Display detail page for a specific Author.
exports.author_detail = function(req, res) {

    let getAuthor = async ()=>{
        let author = Author.findById(req.params.id)
        let books = Book.find({"author":req.params.id},'title summary')
        let authorDetails = await Promise.all([author, books])
        
        return authorDetails[0]===null? new Error("No Author found"):{
            author: authorDetails[0],
            books: authorDetails[1]
        }
    }
    getAuthor().then(results=>{
        console.log(results.author.lifespan)
        res.render("author_details", {title:"Author",authorDetails:results})    
    })
    .catch(err=>{
        console.log(err)
        res.render("author_details",{title:"Author not found",authorDetails:null}) 
    })

};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', { title: 'Create Author'});
};

// Handle Author create on POST.
exports.author_create_post = [

    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Create an Author object with escaped and trimmed data.
            const author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            author.save().then( results => {
                // Successful - redirect to new author record.
                res.redirect(author.url);
             }).catch( err =>{
                 return next(err);
             });
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {
    const getDetails = async ()=>{
        let authorsBooks = Book.find({"author": req.params.id })
        let author = Author.findById(req.params.id)
        let authorDetails = await Promise.all([authorsBooks,author])
        return {authors_books:authorDetails[0],author:authorDetails[1]}
    }
    
    getDetails().then(results=>{
            if (results.author==null) { // No results.
                res.redirect('/catalog/authors');
            }
            // Successful, so render.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    })
};

exports.author_delete_post = function(req, res, next) {
    const getDetails = async ()=>{
        let authorsBooks = Book.find({"author": req.authorid })
        let author = Author.findById(req.authorid)
        let authorDetails = await Promise.all([authorsBooks,author])
        return {authors_books:authorDetails[0],author:authorDetails[1]}
    }
    
    getDetails().then(results=>{
        console.log("Post delete")
        console.log(results)
        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid).then(results => {
                res.redirect('/catalog/authors')
            }).catch(err =>{
                next(err)
            })
        }
    });
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};