const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate("book")
    .then((results) => {
      console.log(results);
      // Successful, so render
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: results,
      });
    })
    .catch((err) => console.log);
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res) {
  const getInstance = async () => {
    console.log("we are in getInstance");
    let bookInst = await BookInstance.findById(req.params.id).populate("book");
    if (bookInst) {
      console.log("we are in returning bookInst");
      return bookInst;
    } else {
      throw new Error("no instanceFound");
    }
  };
  getInstance()
    .then((bookinstance) => {
      res.render("bookinstance_details", {
        title: "Copy: ",
        id: req.params.id,
        bookinstance,
      });
    })
    .catch((err) => {
      console.log(err);
      console.log("we are in error");
      res.render("bookinstance_details", {
        title: "No such copy",
        id: req.params.id,
        bookinstance: null,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, "title").exec(function (err, books) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitise fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, "title").exec(function (err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
  //   res.send(req.body);
  BookInstance.findByIdAndRemove(req.body.bookInstanceId)
    .then((results) => {
      res.redirect(`../book/${req.body.bookid}`);
    })
    .catch((err) => {
      next(err);
    });
  // res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
