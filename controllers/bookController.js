var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
const { body,validationResult } = require('express-validator');
const genre = require('../models/genre');
const book = require('../models/book');

//var async = require('async');

exports.index = function(req, res) {

    //async makes the whole function to be a promise
    async function bookCount(){
     //setting up promises   
        const book_count = Book.countDocuments({});
        //const book_count = Promise.reject("Is that an Error? Yes");

        const book_instance_count = BookInstance.countDocuments({});
        const book_instance_available_count = BookInstance.countDocuments({status:'Available'})
        const author_count = Author.countDocuments({})
        const genre_count = Genre.countDocuments({})

    //to make it run in parallel but takes and returns only arrays
        const counts = await Promise.all([book_count,book_instance_count, book_instance_available_count, author_count, genre_count])

    //turns array of values into an object if you know the order
        let arrayToObject=([book_count,book_instance_count, book_instance_available_count, author_count, genre_count])=>{
            return {book_count,book_instance_count, book_instance_available_count, author_count, genre_count} 
        };
      
        return arrayToObject(counts)
    };


 
     bookCount().then((results) => {
         res.render('index', { title: 'Local Library Home',data: results, error:null } ) 
        })
        .catch(err =>{
            console.log("Catching Err")
            res.render('index', { title: 'Local Library Home',  error: err } )
        })
 
    
    
    };


    // async.parallel({
    //     book_count: function(callback) {
    //         Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
    //     },
    //     book_instance_count: function(callback) {
    //         BookInstance.countDocuments({}, callback);
    //     },
    //     book_instance_available_count: function(callback) {
    //         BookInstance.countDocuments({status:'Available'}, callback);
    //     },
    //     author_count: function(callback) {
    //         Author.countDocuments({}, callback);
    //     },
    //     genre_count: function(callback) {
    //         Genre.countDocuments({}, callback);
    //     }
    // }, function(err, results) {
    //     res.render('index', { title: 'Local Library Home', error: err, data: results });
    // });
// };

// Display list of all Books.
exports.book_list = function(req, res, next) {

    Book.find({}, 'title author')
      .sort({title : 1})
      .populate('author')
      .then(list_books=>{
         
        res.render('book_list', { title: 'Book List', book_list: list_books });
      }).catch(err=>console.log)

    // function (err, list_books) {
    // if (err) { return next(err); }
    // Successful, so render
    // res.json(list_books)
    //  res.render('book_list', { title: 'Book List', book_list: list_books });
    // });
  
  };
  

// Display detail page for a specific book.
exports.book_detail = function(req, res) {
    let getBookDetails = async ()=>{
        let book = Book.findById(req.params.id).populate("author").populate("genre")
        let bookInstances = BookInstance.find({"book":req.params.id})
        let bookDetails = await Promise.all([book,bookInstances])
       if(bookDetails[0]===null){
        throw new Error("No book found")  
       }else{
          return {book:bookDetails[0],bookInstances:bookDetails[1]}
        }
       
    }
   getBookDetails().then(results=>{
        res.render("book_details",{title:"Book Details",bookDetails:results})
   }).catch(err=>{
       console.log(err)
    res.render("book_details",{title:"Book not found",bookDetails:false})
   })
    
};

// Display book create form on GET.
exports.book_create_get = function(req, res) {

    // Get all authors and genres, which we can use for adding to our book.
    const getBookDetails = async() =>{
        const authors = Author.find()
        const genres = Genre.find()
        const detail = await Promise.all( [authors,genres])
        return {authors:detail[0],genres:detail[1]}
    }
    getBookDetails().then( results => {
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres }); 
})
};

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        
        if(!(req.body.genres instanceof Array)){
            if(typeof req.body.genre ==='undefined')
            req.body.genres = [];
            else
            req.body.genres = new Array(req.body.genres);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        let book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genres
           });

          
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            const getBookDetails = async() =>{
                const authors = Author.find()
                const genres = Genre.find()
                const detail = await Promise.all( [authors,genres])
                return {authors:detail[0],genres:detail[1]}
            };
            getBookDetails().then( results => {

                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                        
                    }}
                    
                
                res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres ,errors: errors.array(), book:book}); 
            
            }).catch(err =>console.log(err))
        }
        else {
            // Data from form is valid. Save book.
            book.save().then(results => { 
                res.redirect(book.url);
            }).catch(err=>{
                   res.redirect(book.url);
            });
        }
    }
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
     // Get book, authors and genres for form.
     res.send('NOT IMPLEMENTED: Book delete GET')
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    const getBookDetails = async()=>{
        let bookPr = Book.findById(req.params.id).populate('author').populate('genre');
        let authorsPr = Author.find()
        let genresPr = Genre.find()
        let bookDetail = await Promise.all([bookPr, authorsPr, genresPr])
        const book = bookDetail[0]
        const authors = bookDetail[1]
        const genres = bookDetail[2]
        if(book===null){
            throw new Error('Book not found')
        }
        return {book,authors,genres} 
    }
   getBookDetails().then(results=>{
       for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
           for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
               if (results.genres[all_g_iter]._id.toString()===results.book.genre[book_g_iter]._id.toString()) {
                   results.genres[all_g_iter].checked='true';
               }
           }
       }
       res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });

   })  
};

// Handle book update on POST.
exports.book_update_post = exports.book_update_post = [
    
    // Convert the genre to an array
    (req, res, next) => {
        console.log(req.body.genre)
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        console.log(req.body.genre)
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.

            const getAutorsAndGenres = async ()=>{
                const authorsPr = Author.find()
                const genresPr = Genre.find()
                const detail = await Promise.all([authorsPr,genresPr])
                return {authors:detail[0],genres:detail[1]}
            }
            getAutorsAndGenres().then(results=>{

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];