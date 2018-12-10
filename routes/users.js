const express = require('express');
const mongoose = require('mongoose').set('debug', true);
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();


const {ensureAuthenticated} = require('../helpers/auth');

// Load User Model
const UsersModel = require('../models/User');

// Import schemas
const dateObjectSchema = UsersModel.dateObjectSchema;
const UserSchema = UsersModel.UserSchema;
const dailyEntrySchema = UsersModel.dailyEntrySchema;

// Import models
const User = UsersModel.User; //this is the model of the user, in other word the table
const dateObject = UsersModel.dateObject; //model of dateObject
const DailyEntry = UsersModel.DailyEntry;

// Login Form POST, this is freaking /users/login, WHICH SUCKS.
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect:'/successTest',
    failureRedirect: '/failureTest',
    failureFlash: true
  })(req, res, next);


});

/* Grabs user's info too, I'd LIKE for this to be homepage, but it can't*/
router.get('/successTest', (req, res) => {
  // res.render('testPage', {testMessage: 'Success! Redirecting you...'});

  let currentDate = {
    month: new Date().getMonth(), // 0-11
    date: new Date().getDate(),
    day: new Date().getDay(), //Sun-Sat; 0-6
    year: new Date().getFullYear()
  };

  // It'll be more efficient for the process if we calculate total time coded on every entry/update.
  // but for noww... nah.
  async function updateUserStatus_listEntries (userId) {

    let user = await User.findById(userId);
    let currentCodedDate = (currentDate.month + 1) + '/' + currentDate.date + '/' + currentDate.year;
    let totalTimeCoded = 0, averageCodeTime = 0;

    for(let i = 0; i < user.codingLogEntries.length; i++) {
      totalTimeCoded += user.codingLogEntries[i].minutesCoded;
      console.log('totalTimeCoded (min): ' + totalTimeCoded);
    }

    // Calculates total days member; calls everytime you log in (because no websocket for now)
    let dayJoined = new Date(user.dateJoinedFormatted), today = new Date(currentCodedDate);
    let timeDiff = Math.abs(today.getTime() - dayJoined.getTime());
    let totalDaysMember = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

    // don't want to divide by 0
    if(totalDaysMember == 0) {
      averageCodeTime = totalTimeCoded;
    } else { 
      averageCodeTime = Math.floor(totalTimeCoded / totalDaysMember);
    }

    let result = await User.findOneAndUpdate(
      {"_id": userId},
      {
        "$set": {
          totalTimeCoded,
          totalDaysMember,
          averageCodeTime
        }
      }, {new: true}
    );

    //Set session variables so I can pass it to the home route
    req.session.totalTimeCoded = totalTimeCoded;
    req.session.totalDaysMember = totalDaysMember;
    req.session.averageCodeTime = averageCodeTime;
    req.session.codingLogEntries = user.codingLogEntries;

    console.log('SESSION CHECK AFTER UPDATING: ' + req.session.totalTimeCoded);
    console.log('updateUserStatus (SUCCESSFUL): ' + result);
    res.redirect('/');

  }

  if(req.user.id) {
    setTimeout(function(){ 
      updateUserStatus_listEntries(req.user.id);
    }, 
      1000);
  }

});

router.get('/failureTest', (req, res) => {
  res.render('testPage', {testMessage: 'Failure' });
});

// Register Form POST
router.post('/register', (req, res) => {
  let errors = [];
  let currentDate = {
    month: new Date().getMonth(), // 0-11
    date: new Date().getDate(),
    day: new Date().getDay(), //Sun-Sat; 0-6
    year: new Date().getFullYear()
  };

  console.log('This is the body here:');
  console.log(req.body);
  console.log('END OF BODY');

  if(req.body.password != req.body.confirm_password){
    errors.push({text:'Passwords do not match'});
  }

  if(req.body.password.length < 4){
    errors.push({text:'Password must be at least 4 characters'});
  }

  if(req.body.student_class == 'Select...') {
    errors.push({text: 'Please select your respective class session.'});
  }

  if(errors.length > 0){
    // res.render('index', {
    //   errors: errors,
    //   name: req.body.name,
    //   email: req.body.email,
    //   password: req.body.password,
    //   confirm_password: req.body.confirm_password
    // });

    req.flash('error_msg', errors[0].text); //error_msg is a Global variable made by  using the following...
    /*
      app.use(function(req, res, next){
        res.locals.error_msg = req.flash('error_msg');
      }

    */
    res.redirect('/');

  } else {
    User.findOne({email: req.body.student_email})
      .then(user => {
        if(user){ //if user is found
          req.flash('error_msg', 'Email already registered.');
          res.redirect('/');
        } else {
          let dateJoined = new dateObject({
            month: new Date().getMonth(), // 0-11
            date: new Date().getDate(),
            day: new Date().getDay(), //Sun-Sat; 0-6
            year: new Date().getFullYear()
          });

          let dateJoinedFormatted = (currentDate.month + 1) + '/' + currentDate.date + '/' + currentDate.year;

          const newUser = new User({
            name: req.body.student_name,
            email: req.body.student_email,
            password: req.body.password,
            class: req.body.student_class,
            dateJoined,
            dateJoinedFormatted
          });
          
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can login!');
                  res.redirect('/');
                })
                .catch(err => {
                  console.log(err);
                  return;
                });
            });
          });
        }
      });
  }
});

// Logout User
router.get('/logout', (req, res) => {
  req.session.totalTimeCoded = null; // resets session variable
  req.session.totalDaysMember = null; // resets session variable
  req.session.averageCodeTime = null; // resets session variable
  req.session.codingLogEntries = null; // resets session variable
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});



/* LOG ENTRY =========================================================== */
router.get('/logSummary', ensureAuthenticated, (req, res) => { //I wonder if this would interfere with app's /

});
// I want to get all the entries (for now, later we can limit it for less load time, like 7 at a time)
router.get('/', ensureAuthenticated, (req, res) => { //I wonder if this would interfere with app's /
    console.log('IS ANYONBODY HERE?');
  /*
    1. find entries by user.id
    2. save those objects in the render
    3. sort by... nah, we can print the last index of array
  */
  
  
});

/* Add Entry Route */
router.post('/addEntry', ensureAuthenticated, (req, res) => {
  let errors = [];
  let currentDate = {
    month: new Date().getMonth(), // 0-11
    date: new Date().getDate(),
    day: new Date().getDay(), //Sun-Sat; 0-6
    year: new Date().getFullYear()
  };

  let dateCoded = new dateObject({ //dateObject is a model, therefore dateCoded involves promises
    month: new Date().getMonth(), // 0-11
    date: new Date().getDate(),
    day: new Date().getDay(), //Sun-Sat; 0-6
    year: new Date().getFullYear()
  });

  //validation
  if(!req.body.minutesCodedInput){
    errors.push({text:'Please enter time coded.'});
  }

  // It'll be more efficient for the process if we calculate total time coded on every entry/update.
  // updateUserStatus_listEntries
  /*
    1. This is called when the user logs in, and tries to make changes to log entries
  */
  async function updateUserStatus_listEntries_change (userId) {

    let user = await User.findById(userId);
    let currentCodedDate = (currentDate.month + 1) + '/' + currentDate.date + '/' + currentDate.year;
    let totalTimeCoded = 0, averageCodeTime = 0;

    for(let i = 0; i < user.codingLogEntries.length; i++) {
      totalTimeCoded += user.codingLogEntries[i].minutesCoded;
      console.log('totalTimeCoded (min): ' + totalTimeCoded);
    }

    // Calculates total days member; calls everytime you log in (because no websocket for now)
    let dayJoined = new Date(user.dateJoinedFormatted), today = new Date(currentCodedDate);
    let timeDiff = Math.abs(today.getTime() - dayJoined.getTime());
    let totalDaysMember = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

    // don't want to divide by 0
    if(totalDaysMember == 0) {
      averageCodeTime = totalTimeCoded;
    } else { 
      averageCodeTime = Math.floor(totalTimeCoded / totalDaysMember);
    }

    let result = await User.findOneAndUpdate(
      {"_id": userId},
      {
        "$set": {
          totalTimeCoded,
          totalDaysMember,
          averageCodeTime
        }
      }, {new: true}
    );

    //Set session variables so I can pass it to the home route
    req.session.totalTimeCoded = totalTimeCoded;
    req.session.totalDaysMember = totalDaysMember;
    req.session.averageCodeTime = averageCodeTime;
    req.session.codingLogEntries = user.codingLogEntries;

    console.log('updateUserStatus (SUCCESSFUL UPDATED OR ADDED): ' + result);
    console.log('This is session in updateUserStatus_listEntries_change ' + req.session.totalTimeCoded);
    res.redirect('/');

  }

  //addEntry; called when passes validation
  /*
    1. Grabs current user's id
    2. If last of the array date values are NOT the same as today's value CREATE
    3. If last of the array date values are the same as today's value UPDATE
    https://stackoverflow.com/questions/46457071/using-mongoose-promises-with-async-await
    4. You want to call this function after you find out whether or not the user has already logged today (or at all)
  */
  async function addEntry (userId) {

    //grabs date coded
    let dateCodedFormatted = (currentDate.month + 1) + '/' + currentDate.date + '/' + currentDate.year;

    const user = await User.findById(userId);

    user.codingLogEntries.push(new DailyEntry(
      {
        goal: req.body.goalInput,
        minutesCoded: req.body.minutesCodedInput,
        goalAchieved: req.body.goalAchievedInput,
        dateCoded,
        dateCodedFormatted
        // totalDaysMember
      }
    ));
    await user.save();

    req.flash('success_msg', 'Time coded added!');
    updateUserStatus_listEntries_change(userId);

  }

  //updateEntry
  /*
    1. UpdateFirst method.
    2. Replaces latest array with update object.
    3. Update total and average time coded
  */
  async function updateEntry (userId, entryId) {

    let dateCodedFormatted = (currentDate.month + 1) + '/' + currentDate.date + '/' + currentDate.year;

    // console.log(typeof(newId));
    // console.log(newId);

    let updateLogEntry = {
      goal: req.body.goalInput,
      minutesCoded: req.body.minutesCodedInput,
      goalAchieved: req.body.goalAchievedInput,
      dateCodedFormatted //for some reason when I update dateCodedFormatted after it was added, it erases it from mLab?
    };

    console.log(updateLogEntry);

    let result = await User.findOneAndUpdate(
      { "_id": userId, "codingLogEntries._id": entryId },
      { 
          "$set": {
              "codingLogEntries.$": updateLogEntry
          }
      }, {new: true}
    );

    console.log(result);

    req.flash('success_msg', 'Time coded updated!!');
    updateUserStatus_listEntries_change(userId);
    
  }

  //checkEntry; called before addEntry
  /*
    1. Queries userId --> select User.codingLogEntries.dateCodedFormatted
    2. Is it the latest entry? Is there anything at all in codingLogEntries?
    3. If yes, call updateEntry. If no call addEntry.
  */
  async function checkLatestEntry (userId) {

    let currentCodedDate = (currentDate.month + 1) + '/' + currentDate.date + '/' + currentDate.year;
    const user = await User.findById(userId);

    //if user hasnothing in log OR latestEntryDateFormatted does not match with currentEntryDateFormatted... addEntry
    if(user.codingLogEntries.length === 0) {
      addEntry(userId);
    } else { // if logEntries aren't empty, check for latestDate vs currentDate: same -> update, different -> add
      let lastCodedEntryDate = user.codingLogEntries[user.codingLogEntries.length - 1].dateCodedFormatted;
      let lastCodedEntry = user.codingLogEntries[user.codingLogEntries.length - 1];

      if(lastCodedEntryDate == currentCodedDate) { //if you've already entered in something today, update
        updateEntry(userId, lastCodedEntry._id);
      } else { // if you haven't entered in something today but there are things from the past (I do this because lastCodedEntry would be undefined outside of this else)
        addEntry(userId);
      }

    }

    // req.flash('success_msg', 'Time coded updated!!');
    // res.redirect('/');
  }

  // This is where thing will start firing off
  if(errors.length > 0) {
    req.flash('error_msg', 'Please enter in minutes coded!');
    res.redirect('/');
  } else {
    // addEntry(req.user.id);
    checkLatestEntry(req.user.id);
  }
});

module.exports = router;