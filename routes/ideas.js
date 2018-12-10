const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

//middleware for authentication
const {ensureAuthenticated} = require('../helpers/auth');

// Load User Model
// const UsersModel = require('../models/User');

// // Import schemas
// const dateObjectSchema = UsersModel.dateObjectSchema;
// const UserSchema = UsersModel.UserSchema;
// const dailyEntrySchema = UsersModel.dailyEntrySchema;

// // Import models
// const User = UsersModel.User; //this is the model of the user, in other word the table
// const dateObject = UsersModel.dateObject; //model of dateObject
// const DailyEntry = UsersModel.DailyEntry;

// Add Coding Log
async function addEntry(userId, minutesCoded, goal, goalAchieved) {
  const user = await User.findById(userId); //finds id of current user

  let dateCoded = new dateObject({
    month: new Date().getMonth(), // 0-11
    date: new Date().getDate(),
    day: new Date().getDay(), //Sun-Sat; 0-6
    year: new Date().getFullYear()
  });

  let todayEntry = new DailyEntry({
    goal,
    minutesCoded,
    dateCoded,
    goalAchieved
  });

  user.codingLogEntries.push(todayEntry);
  let result = user.save();
  console.log(result);
}

// Idea Index Page (old)
  router.get('/', ensureAuthenticated, (req, res) => {
    Idea.find({user: req.user.id})
      .sort({date:'desc'})
      .then(ideas => {
        res.render('ideas/index', {
          ideas:ideas
        });
      });
  });

// I want to get all the entries (for now, later we can limit it for less load time, like 7 at a time)
router.get('/', ensureAuthenticated, (req, res) => {

  /*
    1. find entries by user.id
    2. save those objects in the render
    3. sort by... nah, we can print the last index of array
  */

  async function listCourses() { 
    const courses = await Course.find();
    console.log(courses);
  }

  Idea.find({user: req.user.id})
    .sort({date:'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas:ideas
      });
    });
});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    if(idea.user != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('ideas/edit', {
        idea:idea
      });
    }
    
  });
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if(!req.body.title){
    errors.push({text:'Please add a title'});
  }
  if(!req.body.details){
    errors.push({text:'Please add some details'});
  }

  if(errors.length > 0){
    res.render('/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added');
        res.redirect('/ideas');
      })
  }
});

// Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Video idea updated');
        res.redirect('/ideas');
      })
  });
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    });
});

module.exports = router;