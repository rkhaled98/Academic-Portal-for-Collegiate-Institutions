var fs = require('fs');
var getter = require('./askbanner-raw-data-getter');
const path = require('path');


var writeRawData = (id, pin, where) => {
  writeScheduleToFile(id, pin, where);
  writeTranscriptToFile(id, pin, where);
}
/*
the below function first gets the schedule text, and then
appends that to scheduleAndTranscript variable, and then
gets the transcript text, and appends it, then resolves.
*/
function returnScheduleAndTranscript(id, pin) {
  return new Promise( (resolves, rejects) => {
    var scheduleAndTranscript = '';
    getter.getScheduleText(id, pin).then(msg => {
      scheduleAndTranscript += msg;
      return scheduleAndTranscript;
    }).then(msg => {
      getter.getTranscriptText(id, pin).then(trans => {
        scheduleAndTranscript += trans;
        resolves(scheduleAndTranscript);
      })
    });
  });
}

function writeScheduleToFile(id, pin) {
  getter.getScheduleText(id, pin).then(msg => {
    var where = path.join(__dirname, id);
    //console.log(fullPath);
    fs.appendFile(where, msg, (err) => {
        if(err) {
            return console.log(err);
        }
    // console.log("written schedule!");
    })
  });
}
var writeTranscriptToFile = (id, pin) => {
  getter.getTranscriptText(id, pin).then(msg => {
    var where = path.join(__dirname, id);
    //console.log(fullPath);
    fs.appendFile(where, msg, (err) => {
      if(err) {
        return console.log(err);
      }
    // console.log("written transcripts!")
    })
  });
}
module.exports = {
  writeRawData: (id, pin, where) => {writeRawData(id, pin, where)},
  returnScheduleAndTranscript: (id, pin) => {return returnScheduleAndTranscript(id, pin)},
}

// writeRawData("REDACTED", "REDACTED");

// returnScheduleAndTranscript("REDACTED", "REDACTED").then(msg => {
//   console.log(msg);
// })

//REDACTED
