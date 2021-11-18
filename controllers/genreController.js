const Genre = require('../models/genre');
const Book = require('../models/book');
const { body,validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = function(req, res) {
    Genre.find().sort({name:1}).then(results => {
    res.render('genre_list',{title:"Genres",genre_list:results});
    })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res) {

let getDetails = async ()=>{
    let genre_name = Genre.findById(req.params.id)
    let genre_books = Book.find({"genre":req.params.id})
    let details = await Promise.all([genre_name,genre_books])
    console.log(details)
    let genre = {genre:details[0],books:details[1]}
    if(genre.genre ===null){
        throw new Error("Genre not found")
    }
    return genre
}

getDetails().then(results =>{
    res.render('genre_details',{title:"Genre Details",genre:results});   
})
.catch(err=>{
    res.render('genre_details',{title:"Genre not found"})
    console.log(err)
})
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post =  [
    (req, res, next) => {
       
        // Extract the validation errors from a request.

        console.log("----")
          console.log(req.body.name)
        console.log("----")
        next()
    },
    // Validate and santize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {
       
      // Extract the validation errors from a request.
      let errors = validationResult(req);

      // Create a genre object with escaped and trimmed data.
      let genre = new Genre(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
          console.log(errors.array()[0].msg)
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
      }
      else {
          
        // Data from form is valid.
        // Check if Genre with same name already exists.
        console.log(req.body.name)
        Genre.findOne({ 'name': req.body.name })
          .then(  results =>{
             if (results!==null) {
               // Genre exists, redirect to its detail page.
               res.redirect(results.url);
             }
             else {
               genre.save()
                 // Genre saved. Redirect to genre detail page.
                res.redirect(genre.url);
               ;
             }
            }).catch(err=>{
               return next(err); 
            })
           ;
      }
    }
  ];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};