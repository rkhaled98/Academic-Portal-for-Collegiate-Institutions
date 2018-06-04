import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { Wishlist } from '../api/wishlist.js';

import './body.html';

var ProgressBar = require('progressbar.js');

// Assuming we have an empty <div id="container"></div> in
// HTML

// RENDER FUNCTIONS
// RENDER FUNCTIONS
// RENDER FUNCTIONS
// RENDER FUNCTIONS

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  
});

Template.body.onRendered(function bodyOnRendered(){
  $("#course-check").prop('readonly', false);
  // bar = new ProgressBar.Line('#bartest', {easing: 'easeInOut'});  
  
});

// TEMPLATE HELPERS
// TEMPLATE HELPERS
// TEMPLATE HELPERS
// TEMPLATE HELPERS

Template.body.helpers({
  courses() {
    //console.log(Session.get("output"));
    return Session.get("output");
  },

  csClasses() {
    
  },

  wishlist() {
    // Wishlist.rawCollection().distinct('course').then(distinctValues => {
    //   console.log(distinctValues)
    // });
    const data = Wishlist.find({}).fetch();
    // console.log(data);
    const distinctData = _.uniq(data, false, d => d.course);
    // console.log(_.pluck(distinctData, "course"));
    return _.pluck(distinctData, "course");

    // return Wishlist.distinct('course');
    // return Wishlist.distinct({});
    //return Wishlist.collection.distinct();
  },

  canTakeChanged() {
    return Session.get("canTakeChanged");
  }
});

Template.coursesTaken.helpers({
  courses() {
    return Session.get("output");
  },
});

Template.wishlists.helpers({
  wishlist() {
    // Wishlist.rawCollection().distinct('course').then(distinctValues => {
    //   console.log(distinctValues)
    // });
    const data = Wishlist.find({}).fetch();
    // console.log(data);
    const distinctData = _.uniq(data, false, d => d.course);
    // console.log(_.pluck(distinctData, "course"));
    return _.pluck(distinctData, "course");

    // return Wishlist.distinct('course');
    // return Wishlist.distinct({});
    //return Wishlist.collection.distinct();
  },
});

Template.prereqheader.helpers({
  totalUnits(){
    return "15.5";
  },
  majorUnits(){
    return "7.0";
  },
  majorDivision(){
    return "CMPU"
  },
  nextSem(){
    return "Fall of Junior Year"
  }
});

Template.toTakeOrNotToTake.helpers({
  canTake(){
    return Session.get("canTake");
    // $("#blockquote-text").css('color', bool[1])
    // $("blockquote").css('border-left',  '5px solid #00ff51')
    // console.log(Session.get("canTake")[1])
    $("#blockquote-text").css('color', Session.get("canTakeColor"));
    Session.set("canTakeChanged", 0);
    // console.log("can take!@!#");
  }
})

// // the below two functions are used for animation
// var canTakeChanged = function() {
//   Session.set("canTakeChanged", 1);
//   console.log(Session.get("canTakeChanged"));
// }

// Tracker.autorun(function() {
//   var sessionVal = Session.get("canTake");
//   //Template.body.
//   console.log("The session value has changed");
//   canTakeChanged();
// });

// TEMPLATE EVENTS
// TEMPLATE EVENTS
// TEMPLATE EVENTS
// TEMPLATE EVENTS

Template.body.events({
  //todo: change to Template.coursesTaken.events??
  'click .wishlist-item'(event){
   
    var text = event.target.innerHTML;
    text = text.substring(2, text.length)
    // Wishlist.remove({ course: text });
    var Id = Wishlist.find({course: text});
    Id.forEach(element => {
      Wishlist.remove(element._id);
    });
    // Wishlist.remove(Id);
  },
  'click #submitninenumber'(event, template){
    // console.log($("#nine-input"));
    var nineInput = $("#nine-input").val();
    var pinInput = $("#pin-input").val();
    // console.log(pinInput);
    for (var i = 0; i < 1; i+=0.01){
      // bar.animate(i);
    }
    Meteor.call("getCoursesFromReturnScheduleAndTranscriptString", nineInput, pinInput, (error, result) => {
      Session.set("output", result);
      //bar.animate(1);
    });

    $("#course-check").prop('readonly', false);
  },
  'submit .submit-prereq'(event) {
    
    event.preventDefault();
    const text = event.target.text.value.toUpperCase(); // the course in text field
    console.log(text);
    var deps = ''; // will hold the dependencies
    Meteor.call("getReq", text, (error, result) => {
      deps = result; // gets the dependencies and stores in deps var
    });
    Meteor.call("canTake", text, Session.get("output"), (error, result) => { // check to see if they can take
      return new Promise((resolves, rejects) => {
        resolves(result); // send the boolean value to then
      }).then(bool => {
        Session.set("canTake", 
          // if the boolean value is true then they can take, otherwise no and list deps
          bool[0] //== true ? `YOU CAN TAKE ${text}!` : `YOU CANNOT TAKE ${text}. DEPS: ${deps}`
        );
        Session.set("canTakeColor",
          bool[1]
        );
        $("#blockquote-text").css('color', bool[1]);
        $("blockquote").css('border-left',  `5px solid ${bool[1]}`);
        $(".courseTakenDisplay").each((index, element) =>{
          $(element).css("color", "black");
          const elem = $(element)["0"].innerHTML;
          if (bool[2].includes(elem)){
            $(element).css("color", "#00ff51");
          }
         
        });
        $("#blockquote-text").css('color', bool[1]);
        
      });

      // console.log(result + "FIRST");
      // Session.set("canTake", (result) => {
      //   console.log(result);
      //   result == true ? `YOU CAN TAKE ${text}!` : `YOU CANNOT TAKE ${text}. DEPS: ${Session.get("output")}`
      // });


    });
  }
  // 'click .course-check-add-wishlist'(event) {
  //   event.preventDefault();
  //   const text = $("#course-check").val().toUpperCase();

  //   var deps = ''; // will hold the dependencies
  //   Meteor.call("getReq", text, (error, result) => {
  //     deps = result; // gets the dependencies and stores in deps var
  //   });

  //   Wishlist.insert({
  //     course : text
  //   });
  // }

});


Template.prereqheader.events({
  'click .course-check-add-wishlist'(event) {
    event.preventDefault();
    const text = $("#course-check").val().toUpperCase();

    var deps = ''; // will hold the dependencies
    Meteor.call("getReq", text, (error, result) => {
      deps = result; // gets the dependencies and stores in deps var
    });

    Wishlist.insert({
      course : text
    });
  }
});
