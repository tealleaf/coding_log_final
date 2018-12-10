const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);
// DB Config
const db = require('./config/database');

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect(db.mongoURI, {
  useMongoClient: true
})
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false })); //telling system that you don't want algorithm that parses nested objects to urlencoded too
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware
app.use(methodOverride('_method'));

// Express session midleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Fires flash middleware
app.use(flash());

/*
    1. Get current date
    2. If current date is Wednesday, do -1, -2, -3
*/

let todayDate = new Date();

let currentMonth = todayDate.getMonth();
let currentYear = todayDate.getYear();
let day = todayDate.getDate; //get the number day of today (1-31)

/* I hate to do it like this... buttt time crunch */
  function getSunday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + 0; 
    return new Date(d.setDate(diff));
  }
  function getMonday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + 1; 
    return new Date(d.setDate(diff));
  }
  function getTuesday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + 2; 
    return new Date(d.setDate(diff));
  }
  function getWednesday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + 3; 
    return new Date(d.setDate(diff));
  }
  function getThursday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + 4; 
    return new Date(d.setDate(diff));
  }
  function getFriday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + 5; 
    return new Date(d.setDate(diff));
  }
  function getSaturday(d) {
    d = new Date(d);
    let day = d.getDay(),
        diff = d.getDate() - day + 6; 
    return new Date(d.setDate(diff));
  }

/* Get Days */
let thisSunday = getSunday(new Date());
let thisMonday = getMonday(new Date());
let thisTuesday = getTuesday(new Date());
let thisWednesday = getWednesday(new Date());
let thisThursday = getThursday(new Date());
let thisFriday = getFriday(new Date());
let thisSaturday = getSaturday(new Date());

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const daysInWeek = [                   
  {
    name: 'Sun', 
    day: new Date(thisSunday).getDate(),
    isToday: new Date(thisSunday).getDay() == todayDate.getDay(),
    dateFormatted: (new Date(thisSunday).getMonth() + 1) + '/' + new Date(thisSunday).getDate() + '/' + new Date(thisSunday).getFullYear()
  },
  {
    name: 'Mon', 
    day: new Date(thisMonday).getDate(),
    isToday: new Date(thisMonday).getDay() == todayDate.getDay(),
    dateFormatted: (new Date(thisMonday).getMonth() + 1) + '/' + new Date(thisMonday).getDate() + '/' + new Date(thisMonday).getFullYear()
  },
  {
    name: 'Tue', 
    day: new Date(thisTuesday).getDate(),
    isToday: new Date(thisTuesday).getDay() == todayDate.getDay(),
    dateFormatted: (new Date(thisTuesday).getMonth() + 1) + '/' + new Date(thisTuesday).getDate() + '/' + new Date(thisTuesday).getFullYear()
  },
  {
    name: 'Wed', 
    day: new Date(thisWednesday).getDate(),
    isToday: new Date(thisWednesday).getDay() == todayDate.getDay(),
    dateFormatted: (new Date(thisWednesday).getMonth() + 1) + '/' + new Date(thisWednesday).getDate() + '/' + new Date(thisWednesday).getFullYear()
  },
  {
    name: 'Thu', 
    day: new Date(thisThursday).getDate(),
    isToday: new Date(thisThursday).getDay() == todayDate.getDay(),
    dateFormatted: (new Date(thisThursday).getMonth() + 1) + '/' + new Date(thisThursday).getDate() + '/' + new Date(thisThursday).getFullYear()
  },
  {
    name: 'Fri', 
    day: new Date(thisFriday).getDate(),
    isToday: new Date(thisFriday).getDay() == todayDate.getDay(),
    dateFormatted: (new Date(thisFriday).getMonth() + 1) + '/' + new Date(thisFriday).getDate() + '/' + new Date(thisFriday).getFullYear()
  },
  {
    name: 'Sat', 
    day: new Date(thisSaturday).getDate(),
    isToday: new Date(thisSaturday).getDay() == todayDate.getDay(),
    dateFormatted: (new Date(thisSaturday).getMonth() + 1) + '/' + new Date(thisSaturday).getDate() + '/' + new Date(thisSaturday).getFullYear()
  }

];

// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.todayMonth = months[todayDate.getMonth()];
  res.locals.todayYear = todayDate.getFullYear();
  // res.locals.daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  res.locals.daysInWeek = daysInWeek; //daysInWeek[i].dateFormatted

  //Passing current week's variables as globals. We will use this to query our codingLogEntries to see if any match up
  // res.locals.thisSundayFormatted = daysInWeek[0].dateFormatted;
  // res.locals.thisSundayFormatted = daysInWeek[1].dateFormatted;
  // res.locals.thisSundayFormatted = daysInWeek[2].dateFormatted;
  // res.locals.thisSundayFormatted = daysInWeek[3].dateFormatted;
  // res.locals.thisSundayFormatted = daysInWeek[4].dateFormatted;
  // res.locals.thisSundayFormatted = daysInWeek[5].dateFormatted;
  // res.locals.thisSundayFormatted = daysInWeek[6].dateFormatted;

  next(); //we made our own middleware, so the process needs to go on after this
});

// Index Route
app.get('/', (req, res) => {
  const title = 'CodingLog Home';

  let totalTimeCoded = req.session.totalTimeCoded;
  console.log('This is totalTimeCoded in get /' + totalTimeCoded);
  let totalDaysMember = req.session.totalDaysMember;
  let averageCodeTime = req.session.averageCodeTime;
  let codingLogEntries = req.session.codingLogEntries;

  res.render('index', {
    title: title,
    totalTimeCoded,
    totalDaysMember,
    averageCodeTime,
    codingLogEntries
  });

});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Use routes
// app.use(ideas);
app.use(users);

const port = process.env.PORT || 3000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});


/*
 Notes (for myself):
  1. INJECTIONS. SECURITY.
  2. TRY CATCH, ERROR HANDLING.
  3. Redirect all other urls to home or not found
  4. node --trace-warnings app.js
  5. Ran into the problem of declaring and initalizing a variable and then it suddenly becomes undefined because of asynchronous programming. Because my function was async... the things inside of it were running async so variables got messed up
  6. findByIdAndUpdate issue. findById issue. mongoose = require('mongoose').set('debug', true);, why pluralize, why, it's NOT smart! HOLY SHIT IT WENT AS FAR AS MODIFYING MY COLLECTION TO BE FROM DAILYENTRY TO DAILYENTRIES. 
*/