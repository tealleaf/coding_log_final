const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create dateObject Schema
const dateObjectSchema = new mongoose.Schema({
  month: {
    type: Number
  },
  date: {
    type: Number
  },
  day: {
    type: Number
  }, //Monday or 1
  year: {
    type: Number
  }
});

// dateObject Model
const dateObject = mongoose.model('date', dateObjectSchema);

// Create Daily Log Schema
const dailyEntrySchema = new mongoose.Schema({

  goal: {
    type: String,
    maxlength: 250,
    default: 'Nothing yet'
  },
  belongsToUser: {
    type: String
  },
  workCompleted: {
    type: String,
    maxlength: 250,
    default: 'Nothing yet'
  },
  minutesCoded: {
    type: Number,
    default: 0
  },
  dateCoded: {
    type: dateObjectSchema
  },
  dateCodedFormatted: {
    type: String //will hold '12/8/18'
  },
  goalAchieved: {
    type: Boolean,
    default: false
  }

});

// Daily Entry Model
const DailyEntry = mongoose.model('dailyentries', dailyEntrySchema);

// Create Schema
const UserSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true, 
    maxlength: 255
  },
  email:{
    type: String,
    required: true,
    unique: true,
    maxlength: 255
  },
  classSection: {
    type: String,
    require: true
  },
  password:{
    type: String,
    required: true,
    minlength: 4
  },

  dateJoined: {
    type: dateObjectSchema
  }, 
  dateJoinedFormatted: {
    type: String // 12/8/18
  },

  totalDaysMember: {
    type: Number,
    default: 0
  },

  totalTimeCoded: {
    type: Number,
    default: 0
  },
  averageCodeTime: {
    type: Number,
    default: 0
  },

  codingLogEntries: {
    type: [dailyEntrySchema]
  }

},
{ usePushEach: true }); //$pushAll has been deprecated, this is a workaround

// Users model
const User = mongoose.model('users', UserSchema); //this is going to be called "userss" on mLab
//mongoose.model('TableNameCollections', SchemaYouCreated);


// Users model
//mongoose.model('users', UserSchema); //this is going to be called "userss" on mLab
//mongoose.model('TableNameCollections', SchemaYouCreated);

module.exports = {
  dateObjectSchema,
  UserSchema,
  dailyEntrySchema,
  User,
  dateObject,
  DailyEntry
}