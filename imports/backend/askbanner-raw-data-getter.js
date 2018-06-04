var webdriverio = require("webdriverio");
var options = {
	desiredCapabilities:
	{
			browserName: 'phantomjs',
			//commandLineFlags: '--headless'

	}
};


function getScheduleText(id, pin) {
	return new Promise(function(resolves, rejects){
		webdriverio
			.remote(options)
			.init()
			.url("https://aisapps.vassar.edu/askbanner/stuinfo.html")
			.setValue("input[name='id']", String(id))
			.setValue("input[name='pin']", String(pin))
			.click("input[value='Logon']")
			.selectByVisibleText("select[name='session']", "Spring 18")
			.click("input[value='Schedule']")
			.getText("body").then(function(body) {
				resolves(body)
			})
			.getTitle().then(function(title) {
				console.log("Title was: " + title)
			})
			.end()
			.catch(function(err) {
				rejects(err)
			})
	});
}

function getTranscriptText(id, pin) {
	return new Promise((resolves, rejects) =>{
		webdriverio
			.remote(options)
			.init()
			.url("https://aisapps.vassar.edu/askbanner/stuinfo.html")
			.setValue("input[name='id']", String(id))
			.setValue("input[name='pin']", String(pin))
			.click("input[value='Logon']")
			.click("input[value='Transcript']")
			.getText("body").then(text => {
				resolves(text)
			})
			.end()
			.catch(function(err) {
				rejects(Error(err))
			});
	});
}

module.exports = {
	getScheduleText: (id, pin) => getScheduleText(id, pin),
	getTranscriptText: (id, pin) => getTranscriptText(id, pin)
};

 //getScheduleText("999 OMITTED", "PIN OMITTED")
 //.then(msg => console.log(msg));
//getScheduleText().then(msg => console.log(msg))
//console.log(getTranscriptText());
//console.log(getScheduleText());
//getScheduleText();
