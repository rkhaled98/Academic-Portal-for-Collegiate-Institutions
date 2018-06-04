var fs = require('fs');

var read = (id) =>{
  // this function simply put retrieves the file name in current directory
  // in accordance with the id of the student
  return new Promise((resolves, rejects) => {
    fs.readFile('./'+String(id), 'utf8', (err,data) => {
      if (err) {
        rejects(Error(err));
      }
      else {resolves(data)} // return the file
    });
  });
}

var parseString = (data) => {
  return new Promise((resolves, rejects) => {
      // these two expressions will be used to get the index between the bounds
     // of the transcript
     var regex1 = new RegExp('Vassar College Work');
     var regex2 = new RegExp('Total NRO');
     var transcript = data.substring(data.match(regex1).index, data.match(regex2).index);

     // these two expressions will be used to get the index between the bounds
     // of the schedule
     var regex3 = new RegExp('Registered');
     var regex4 = new RegExp(".* - See lists at the Registrar's Office for your place on the Waitlist\n*");
     var schedule = data.substring(data.match(regex3).index, data.match(regex4).index);

     resolves(String(transcript + schedule));
  });
}

var parse = (id) =>{

   return new Promise((resolves, rejects) => {
     // read the data, get the raw file as input!
     read(id).then(data => {
     // these two expressions will be used to get the index between the bounds
     // of the transcript
     var regex1 = new RegExp('Vassar College Work');
     var regex2 = new RegExp('Total NRO');
     var transcript = data.substring(data.match(regex1).index, data.match(regex2).index);

     // these two expressions will be used to get the index between the bounds
     // of the schedule
     var regex3 = new RegExp('Registered');
     var regex4 = new RegExp(".* - See lists at the Registrar's Office for your place on the Waitlist\n*");
     var schedule = data.substring(data.match(regex3).index, data.match(regex4).index);

     resolves(String(transcript + schedule));
   });
 })
}

var parseFurther = (id) => {
  // currently, this function returns something of this form:
  // the list of courses taken, may contain duplicates.

  /*
  [ 'CHIN 105',
    'CLCS 186',
    'CMPU 101',
    'PHYS 113',
    'CHIN 106',
    'CMPU 102',
    'CMPU 145',
    'PHYS 114',
    'CHIN 205',
    'CMPU 203',
    'CMPU 224',
    'PHIL 125',

    'CMPU-298',
    'CMPU-375',
    'COGS-298',
    'MATH-220' ] '===> 16 courses taken!'
  */
  return new Promise((resolves, rejects) => {
    parseString(id).then(data => {
      var coursesTaken = [];
      var lines = data.split('\n');
      var reg1 = new RegExp('.*([A-Z]{4} [0-9]{3})');
      var reg2 = new RegExp('.*([A-Z]{4}-[0-9]{3})')
      for (var i = 0 ; i < lines.length ; i ++){
        if(lines[i].match(reg1)){
          coursesTaken.push(lines[i].match(reg1)[1].replace(" ", "-"));
        }
        else if (lines[i].match(reg2)){
          coursesTaken.push(lines[i].match(reg2)[1]);
        }
        else{}
      }
      resolves(coursesTaken);
      //console.log(coursesTaken, `===> ${coursesTaken.length} courses taken!`);

    });
  })
}

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

// Array.prototype.intersection = function(a) {

// }

var canTake = (course, coursesTaken) => {
  // assumptions:
  // getReq function returns, given a course, an array of dependencies
  // where PERM, if it is in the course dependency list, is the last element.
  // if a course is optional
  return new Promise( (resolves, rejects) => {
    const deps = getReq(course); // collect the array of pre requisites

    const notSatisfied = deps.diff(coursesTaken);
    const satisfied = _.intersection(coursesTaken, deps);
    // console.log(`NOT SATISFIED: ${notSatisfied}`)

    // below are three resolve messages
    const alreadyTakenMsg = `YOU HAVE ALREADY TAKEN ${course}`;
    if (course == "CMPU-375"){ // a joke
      // console.log("hi");
      // console.log(typeof(course));
      const endDate = new Date("May, 21, 2018, 19:00:00");
      const now = new Date();
      const minutesLeft = Math.floor((endDate - now) / 60000);
      resolves([`YOU HAVE ALREADY TAKEN CMPU-375. In ${minutesLeft} minutes, you will have been thoroughly enlightened about computer networks.`, "#00ff51", satisfied]);
    }
    if (coursesTaken.includes(course)){
      resolves([alreadyTakenMsg, 'grey', satisfied, notSatisfied]);
    }
    // console.log(course);


    const takeableMsg = `YOU CAN TAKE ${course}!`;
    const takeableWithPermMsg = `YOU MAY BE ABLE TO TAKE ${course} WITH PERMISSION FROM THE INSTRUCTOR.`;
    const notTakeableMsg = `YOU CANNOT TAKE THIS COURSE. YOU MUST TAKE: ${notSatisfied}`;

    // this flag will be set to true if PERM from instructor may allow for you to take the course
    var needPermFlag = true;

    // this array will hold a list of classes that are recommended to take
    var optionalClassesFulfilled = [];
    // this flag will be true if there are any recommended classes to take.
    var optionalClassesFlag = false;

    deps.forEach(dep => {
      // console.log(dep);
      if(dep == "NONE") {resolves([takeableMsg, '#00ff51', satisfied]);}
      if(dep.includes("OPT")){
        optionalClassesFlag = true;
        const id = dep.match(new RegExp('OPT=([A-Z]{4}-[0-9]{3})'))[1]; //id is course but course is used in the function call so...
        if(coursesTaken.includes(id)){
          optionalClassesFulfilled.push(id);
        }
        return;
      }
      if (coursesTaken.includes(dep) && dep != "PERM") {
        needPermFlag = false;
      }
      if (dep.includes("|")) {
        const disjuncts = dep.split("|");
        // the below const will be true if at least ONE of the disjuncts
        // is included in the list of coursesTaken.
        const satisfiesAtLeastOne = disjuncts.some(disjunct => {
          return coursesTaken.includes(disjunct);
        });
        if (satisfiesAtLeastOne == false){
          deps.includes("PERM") ? resolves([takeableWithPermMsg, 'grey', satisfied]) : resolves([notTakeableMsg, 'red', notSatisfied]);
        }
      }
      else if (!coursesTaken.includes(dep) && dep != "PERM"){
        // when the dependency for course is not in the list of courses taken,
        // and also when the dependency is not PERM, check if the list of dependencies
        // contains PERM, and if so respond with takeableWithPermMsg, if not
        // they may not take the course.
        deps.includes("PERM") ? resolves([takeableWithPermMsg, 'grey', satisfied]) : resolves([notTakeableMsg, 'red', satisfied, notSatisfied]);
      }
      else if (dep == "PERM"){
        needPermFlag == true ? resolves([takeableWithPermMsg, 'grey', satisfied]) : resolves([takeableMsg, '#00ff51', satisfied]);
      }
    });
    if (optionalClassesFlag) {
      let optionalClassesActuallyTakenFlag = optionalClassesFulfilled.length != 0;
      let msg = takeableMsg + ` YOU HAVE FULFILLED ${optionalClassesActuallyTakenFlag ? "" : "NO"} RECOMMENDED COURSES: ${optionalClassesActuallyTakenFlag ? optionalClassesFulfilled : ""}`;
      resolves([msg, '#00ff51', satisfied]);
    }
    else {
      resolves([takeableMsg, '#00ff51', satisfied]);
    }
  });
}

var getReq = (course) => {
  // is used by the canTake function to return the array of pre requisites for a given course
  return reqs[course];
}

var printReqs = (course) => {
  // print a list of reqs
  // console.log(reqs[course]);
}

// parseFurther("999497897").then(data => console.log(data));

module.exports = {
  parseFurther: data => parseFurther(data),
  getReq: course => getReq(course),
  canTake: (course, courses) => canTake(course, courses),
}


reqs = {
  "CMPU-101": ["NONE"],
  "CMPU-102": ["CMPU-101"],
  "CMPU-145": ["CMPU-101"],
  "CMPU-203": ["CMPU-102"],
  "CMPU-224": ["CMPU-102", "CMPU-145"],
  "CMPU-235": ["CMPU-102", "CMPU-145"],
  "CMPU-240": ["CMPU-102", "CMPU-145"],
  "CMPU-241": ["CMPU-102", "CMPU-145"],
  "CMPU-245": ["CMPU-102", "CMPU-145"],
  "CMPU-250": ["MATH-126|MATH-127|MATH-220", "CMPU-102"],
  "CMPU-295": ["PERM"],
  "CMPU-298": ["PERM"],
  "CMPU-324": ["CMPU-224"],
  "CMPU-325": ["CMPU-224"],
  "CMPU-331": ["CMPU-224", "CMPU-240", "OPT=CMPU-235", "OPT=CMPU-245"],
  "CMPU-334": ["CMPU-203", "CMPU-224"],
  "CMPU-353": ["CMPU-203", "BIOL-238|BIOL-224|BIOL-248", "PERM"],
  "CMPU-365": ["CMPU-203", "CMPU-245", "CMPU-145", "PERM"],
  "CMPU-366": ["OPT=CMPU-240"],
  "CMPU-375": ["CMPU-203", "PERM"],
  "CMPU-376": ["PERM"],
  "CMPU-377": ["CMPU-203", "CMPU-224"],
  "CMPU-378": ["CMPU-203", "MATH-221"],
  "CMPU-379": ["CMPU-203", "CMPU-224"],
  "CMPU-395": ["CMPU-241"],
  "CMPU-399": ["CMPU-224", "CMPU-203", "OPT=CMPU-375"],
};

//testing("CMPU-250")

// parseFurther(raw).then(taken => {
//   canTake("CMPU-375", taken).then(result => {
//     console.log(result);
//   })
// })
