import { Meteor } from 'meteor/meteor';

var writer = require('../imports/backend/writer');
var parser = require('../imports/backend/parser');


import '../imports/api/wishlist.js';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  getUsers2: name => {
    return "hey";
  },
  returnScheduleAndTranscript: (id, pin) => {
    return writer.returnScheduleAndTranscript(id, pin);
  },
  getCoursesFromReturnScheduleAndTranscriptStringMock: (id, pin) => {
    return new Promise((resolves, rejects) => {
      const raw = `enter raw data from ASK BANNER HERE`
      resolves(parser.parseFurther(raw));
    });
  },
  getCoursesFromReturnScheduleAndTranscriptString: (id, pin) => {
    // this function returns a new Promise which resolves to an array of courses taken.
    return new Promise((resolves, rejects) => {
      writer.returnScheduleAndTranscript(id, pin).then(data => {
        resolves(parser.parseFurther(data));
      });
    });
  },
  getReq: (course) => {
    return parser.getReq(course);
  },
  canTake: (course, courses) => {
    return parser.canTake(course, courses);
  }

});
