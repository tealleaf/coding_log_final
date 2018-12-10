  function checkLatestEntry (user) {

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

    // String type of current date (12/3/2018)
    let latestEntryIndex = user.codingLogEntries[user.codingLogEntries.length - 1] || 'noEntries_latestEntryIndex'; // -1 if no entry yet
    let entryStatus;
    // You have no latest entry, so cannot get latestEntryDate, default date to today
    if (latestEntryIndex == 'noEntries_latestEntryIndex') {
      console.log('Im here yo');
      let latestEntryDate = '00/00/00';
    } else { // There is a latest entry
      console.log('how the fu... am i in here?');
      let latestEntryDate = (latestEntryIndex.dateCoded.month + 1) + '/' + latestEntryIndex.dateCoded.date + '/' + latestEntryIndex.dateCoded.year; //latest could mean 2 days ago
    }
    console.log('latestEntryDate value: ' + latestEntryDate);

    let currentEntryDate = (currentDate.month + 1) + '/' + currentDate.date + '/' + currentDate.year;

    let userJoined = user.dateJoined;
    let userJoinedDate = (userJoined.month + 1) + '/' + userJoined.date + '/' + userJoined.year;

    // Calculates total days coded
    let dayJoined = new Date(userJoinedDate), today = new Date(currentEntryDate);
    let timeDiff = Math.abs(today.getTime() - dayJoined.getTime());
    let totalDaysMember = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

    //if user hasn't entered anything OR if latestEntry's dates are NOT the same as currentEntry's dates
    if(currentEntryDate != latestEntryDate) {

      console.log('I should be here where currentEntryDate !== latestEntryDate');

      user.codingLogEntries.push(new DailyEntry(
        {
          goal: req.body.goalInput,
          minutesCoded: req.body.minutesCodedInput,
          goalAchieved: req.body.goalAchievedInput,
          dateCoded,
          totalDaysMember
        }
      ));
      user.save();

      entryStatus = 'New log added';

    } else {
        console.log('ohai');
        // console.log(latestEntryIndex._id);
        let updateLogEntry = {
          goal: req.body.goalInput,
          minutesCoded: req.body.minutesCodedInput,
          goalAchieved: req.body.goalAchievedInput,
          totalDaysMember
        };

        try {
          let logEntry = DailyEntry.findOneAndUpdate({_id: latestEntryIndex._id}, updateLogEntry); //should be id of latest entry; not user
          console.log(logEntry);
          user.save();
        } catch (err) {
          console.log('Error while trying to findOneAndUpdate');
          console.log(err);
        }

        entryStatus = 'Latest log updated';
    }

    let logData = {
      totalDaysMember,
      entryStatus
    };

    return logData;
  }