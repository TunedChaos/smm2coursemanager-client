// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')
var remote = require('electron').remote
const {dialog} = require('electron').remote
var dateFormat = require('dateformat')

const io = require('socket.io-client')
var socket = io.connect(remote.getGlobal('sharedSettings').serverAddress)

var authCode = remote.getGlobal('sharedSettings').authCode

var thisPlatform = "SMM2 Course Manager Client"
var thisPlatformID = "0"

socket.emit('list_courses')
socket.on('course_list', function(response) {
    loadCourses(response)
})

ipcRenderer.on('forceReload', () =>
{
    location.reload()
})

socket.on('status_change', function(response){
    var responseData = JSON.parse(response)
    var messageDiv = document.getElementById('messagediv')
    messageDiv.style.visibility = "hidden"
    messageDiv.style.display = "none"
    switch(responseData.success){
        case 0:
            messageDiv.className = "redfade"
            messageDiv.style.color = "red"
            break
        case 1:
            messageDiv.className = "greenfade"
            messageDiv.style.color = "green"
            break
    }
    if(responseData.message !== null)
    {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        messageDiv.style.visibility = "visible"
        messageDiv.style.display = "block"
        messageDiv.innerHTML = responseData.message
    }
    socket.emit('list_courses')
    ipcRenderer.send('updateStatusBar')
})

socket.on('refresh_course_list', function(){
	socket.emit('list_courses')
})

function changeSubmissionEnabled(object){
    console.log(JSON.parse(object.value))
    socket.emit('change_submission_enabled', JSON.parse(object.value), authCode)
}

function changeMaxCourses(object){
    console.log(JSON.parse(object.value))
    socket.emit('change_max_courses_per_platform', JSON.parse(object.value), authCode)
}

function loadCourses(data){
    responseArray = JSON.parse(data)
    console.log(responseArray)
    var courseTableBuild = ''
    courseTableBuild += '<table id="coursetable" class="courseTableClass" style="border-bottom: 0">'
    courseTableBuild += '<thead>'
    courseTableBuild += '<tr>'
    courseTableBuild += '<td class="celldisplay" style="padding-top: 3px; padding-bottom: 3px; width: 50%">'
    courseTableBuild += 'Course submission is '
    switch(responseArray['submissionEnabled']){
        case true:
            courseTableBuild += "<select class='courseStatusSelect' style='background-color: green; color: white' onchange='changeSubmissionEnabled(this);'>"
            courseTableBuild += "<option selected='selected' value='true'>enabled</option>"
            courseTableBuild += "<option value='false' style='background-color:red'>disabled</option>"
            courseTableBuild += "</select>"
            break
        case false:
            courseTableBuild += "<select class='courseStatusSelect' style='background-color: red; color: white' onchange='changeSubmissionEnabled(this);'>"
            courseTableBuild += "<option value='true' style='background-color: green'>enabled</option>"
            courseTableBuild += "<option selected='selected' value='false'>disabled</option>"
            courseTableBuild += "</select>"
            break
    }
    courseTableBuild += '.</td>'
    courseTableBuild += '<td class="celldisplay" style="padding-top: 3px; padding-bottom: 3px;">'
    courseTableBuild += 'Max courses per user per platform: '
    courseTableBuild += '<input style="width: ' + (responseArray['coursesPerPlatform'].toString().length + 3) + 'ch;" type="number" id="coursesPerPlatform" value="' + responseArray['coursesPerPlatform'] + '" onchange="this.style.width = ((this.value.length + 3)) + \'ch\'; changeMaxCourses(this);">'
    courseTableBuild += ' | 0 is Unlimited'
    courseTableBuild += '</td>'
    courseTableBuild += '</tr>'
    courseTableBuild += '</thead>'
    courseTableBuild += '</table>'
    courseTableBuild += '<table id="coursetable" class="courseTableClass">'
    courseTableBuild += '<tr>'
    courseTableBuild += '<td class="celldisplay">'
    courseTableBuild += '<input id="newCourseCode" onfocusin="newCourseFocusIn(this)" onfocusout="newCourseFocusOut(this)" value="XXX-XXX-XXX">'
    courseTableBuild += '</td>'
    courseTableBuild += '<td class="celldisplay">'
    courseTableBuild += '<input id="newSubmitter" onfocusin="newSubmitterFocusIn(this)" onfocusout="newSubmitterFocusOut(this)" value="Person\'s Name">'
    courseTableBuild += '</td>'
    courseTableBuild += '<td colspan="4" class="celldisplay">'
    courseTableBuild += '<button type="button" onclick="smm2_addCourse()">Add Course</button>'
    courseTableBuild += '</td>'
    courseTableBuild += '</tr>'
    courseTableBuild += '   <tr>'
    courseTableBuild += '       <th class="celldisplay">Course Code</th>'
    courseTableBuild += '       <th class="celldisplay">Submitter</th>'
    courseTableBuild += '       <th class="celldisplay">Submitted on</th>'
    courseTableBuild += '       <th class="celldisplay">Last Updated on</th>'
    courseTableBuild += '       <th class="celldisplay">Status</th>'
    courseTableBuild += '       <th class="celldisplay">Delete</th>'
    courseTableBuild += '  </tr>'
    courseTableBuild += '<tbody id="coursebody">'
    courseTableBuild += '   <tr>'
    courseTableBuild += '       <td colspan="3"><img src="./images/loading.gif"></td>'
    courseTableBuild += '   </tr>'
    courseTableBuild += '</tbody>'
    document.getElementById('tablesdiv').innerHTML = courseTableBuild
    var courses = responseArray['courseList']
    courses.sort((a,b) => (a.Status > b.Status ? 1 : -1))
    var courseBodyBuild = ''
    var dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    var submittedDate = new Date()
    var updatedDate = new Date()
    courses.forEach(course => {
        submittedDate = dateFormat(course.createdAt,"mmmm d, yyyy h:M TT")
        updatedDate = dateFormat(course.updatedAt,"mmmm d, yyyy h:M TT")
        courseJSON = JSON.stringify(course)
        courseBodyBuild += '<tr>'
        courseBodyBuild += '<td class="celldisplay">'
        courseBodyBuild += '<input class="updateInput" onchange="smm2_updateRecord(this)" data-course=\'' + courseJSON + '\' id="CourseRecord" type="text" value="' + course.CourseID + '">'
        courseBodyBuild += '</td>'
        courseBodyBuild += '<td class="celldisplay">'
        courseBodyBuild += '<input class="updateInput" onchange="smm2_updateRecord(this)" data-course=\'' + courseJSON + '\' id="SubmitterRecord" type="text" value="' + course.Submitter + '">'
        courseBodyBuild += '</td>'
        courseBodyBuild += '<td class="celldisplay">'
        courseBodyBuild += submittedDate
        courseBodyBuild += '</td>'
        courseBodyBuild += '<td class="celldisplay">'
        courseBodyBuild += updatedDate
        courseBodyBuild += '</td>'
        var statusValue = ''
        switch(course.Status){
        case 0:
            statusValue += '<td class="celldisplay" style="background-color: red; color: white;">'
            statusValue += '<select class="courseStatusSelect" style="background-color: red; color: white;" name="' + course.CourseID + '" id="' + course.CourseID + '" onchange="smm2_updateStatus(this);">'
            statusValue += '<option selected="selected">Unplayed</option>'
            statusValue += '<option style="background-color: yellow; color: black;">Playing</option>'
            statusValue += '<option style="background-color: lightgreen; color: black;">Played</option>'
            statusValue += '<option style="background-color: green; color: white;">Completed</option>'
            statusValue += '</select>'
            statusValue += '</td>'
            break
        case 1:
            statusValue += '<td class="celldisplay" style="background-color: yellow">'
            statusValue += '<select class="courseStatusSelect" style="background-color: yellow" name="' + course.CourseID + '" id="' + course.CourseID + '" onchange="smm2_updateStatus(this);">'
            statusValue += '<option>Unplayed</option>'
            statusValue += '<option selected="selected">Playing</option>'
            statusValue += '<option style="background-color: lightgreen; color: black;">Played</option>'
            statusValue += '<option style="background-color: green; color: white;">Completed</option>'
            statusValue += '</select>'
            statusValue += '</td>'
            break
        case 2:
            statusValue += '<td class="celldisplay" style="background-color: lightgreen; color: black;">'
            statusValue += '<select class="courseStatusSelect" style="background-color: lightgreen; color: black;" name="' + course.CourseID + '" id="' + course.CourseID + '" onchange="smm2_updateStatus(this);">'
            statusValue += '<option>Unplayed</option>'
            statusValue += '<option style="background-color: yellow; color: black;">Playing</option>'
            statusValue += '<option selected="selected">Played</option>'
            statusValue += '<option style="background-color: green; color: white;">Completed</option>'
            statusValue += '</select>'
            statusValue += '</td>'
            break
        case 3:
            statusValue += '<td class="celldisplay" style="background-color: green; color: white">'
            statusValue += '<select class="courseStatusSelect" style="background-color: green; color: white" name="' + course.CourseID + '" id="' + course.CourseID + '" onchange="smm2_updateStatus(this);">'
            statusValue += '<option>Unplayed</option>'
            statusValue += '<option style="background-color: yellow; color: black;">Playing</option>'
            statusValue += '<option style="background-color: lightgreen; color: black;">Played</option>'
            statusValue += '<option selected="selected">Completed</option>'
            statusValue += '</select>'
            statusValue += '</td>'
            break
        }
        courseBodyBuild += statusValue
        courseBodyBuild += '<td class="celldisplay" style="color: red">'
        courseBodyBuild += '<a href="#" data-courseid="' + course.CourseID + '" onclick="smm2_removeCourse(this)">X</a>'
        courseBodyBuild += '</td>'
    })
    courseBodyBuild += '</tr>'
    document.getElementById('coursebody').innerHTML = courseBodyBuild
}

function smm2_addCourse(){
    newCourseCodeField = document.getElementById('newCourseCode')
    newSubmitterField = document.getElementById('newSubmitter')
    if(newCourseCodeField.value !== newCourseCodeField.defaultValue && newSubmitterField.value !== newSubmitterField.defaultValue)
    {
        newCourseCode = newCourseCodeField.value
        newSubmitter = newSubmitterField.value
        socket.emit('add_course', thisPlatform, thisPlatformID, newSubmitter, newCourseCode, authCode)
    }else{
        var messageDiv = document.getElementById('messagediv')
        setTimeout(() => {
            messageDiv.className = ''
        }, 1000)
        messageDiv.className = "redfade"
        messageDiv.style.color = "red"
        messageDiv.style.visibility = "visible"
        messageDiv.style.display = "block"
        messageDiv.innerHTML = "Please enter a course code and person's name"
        document.body.scrollTop = document.documentElement.scrollTop = 0
    }
}

function newCourseFocusIn(object)
{
    if(object.value === object.defaultValue)
    {
        object.value = ""
        object.defaultValue = ""
        object.style.color = "black"
    }
}

function newCourseFocusOut(object){
    if(object.value === "")
    {
        object.style.color = "lightgray"
        object.value = "XXX-XXX-XXX"
        object.defaultValue = "XXX-XXX-XXX"
    }
}

function newSubmitterFocusIn(object)
{
    if(object.value === object.defaultValue)
    {
        object.value = ""
        object.defaultValue = ""
        object.style.color = "black"
    }
}

function newSubmitterFocusOut(object){
    if(object.value === "")
    {
        object.style.color = "lightgray"
        object.value = "Person's Name"
        object.defaultValue = "Person's Name"
    }
}

function smm2_updateStatus(selectedObject){
    socket.emit('change_status', selectedObject.id, selectedObject.selectedIndex, authCode)
}

socket.on('course_add', function(response){
    var responseData = JSON.parse(response)
    var messageDiv = document.getElementById('messagediv')
    messageDiv.style.visibility = "hidden"
    messageDiv.style.display = "none"
    switch(responseData.success){
        case 0:
            messageDiv.className = "redfade"
            messageDiv.style.color = "red"
            break
        case 1:
            messageDiv.className = "greenfade"
            messageDiv.style.color = "green"
            break
    }
    if(responseData.message !== null)
    {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        messageDiv.style.visibility = "visible"
        messageDiv.style.display = "block"
        messageDiv.innerHTML = responseData.message
    }
    socket.emit('list_courses')
})

function smm2_removeCourse(selectedObject){
    dialog.showMessageBox({
        "type": "warning",
        "buttons": ["&Yes","&No"],
        "defaultId": 1,
        "title": "Delete Course",
        "message": "Are you sure you want to delete this course?"
    },
    res => {
        if(res === 0)
        {
            socket.emit('remove_course', selectedObject.dataset.courseid, authCode)
        }
    })
}
socket.on('course_remove', function(response){
    var responseData = JSON.parse(response)
    var messageDiv = document.getElementById('messagediv')
    messageDiv.style.visibility = "hidden"
    messageDiv.style.display = "none"
    switch(responseData.success){
        case 0:
            messageDiv.className = "redfade"
            messageDiv.style.color = "red"
            break
        case 1:
            messageDiv.className = "greenfade"
            messageDiv.style.color = "green"
            break
    }
    if(responseData.message !== null)
    {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        messageDiv.style.visibility = "visible"
        messageDiv.style.display = "block"
        messageDiv.innerHTML = responseData.message
    }
    socket.emit('list_courses')
})

function smm2_updateRecord(object){
    course = JSON.parse(object.dataset.course)
    if(object.id === "CourseRecord")
    {
        socket.emit('update_course', course.id, object.value, course.Submitter, course.Status, authCode)
    }else if(object.id === "SubmitterRecord")
    {
        socket.emit('update_course', course.id, course.CourseID, object.value, course.Status, authCode)
    }
}

socket.on('course_update', function(response) {
    var responseData = JSON.parse(response)
    var messageDiv = document.getElementById('messagediv')
    messageDiv.style.visibility = "hidden"
    messageDiv.style.display = "none"
    switch(responseData.success){
        case 0:
            messageDiv.className = "redfade"
            messageDiv.style.color = "red"
            break
        case 1:
            messageDiv.className = "greenfade"
            messageDiv.style.color = "green"
            break
    }
    if(responseData.message !== null)
    {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        messageDiv.style.visibility = "visible"
        messageDiv.style.display = "block"
        messageDiv.innerHTML = responseData.message
    }
    socket.emit('list_courses')
})

function showStatusBar(){
    ipcRenderer.send('showStatusBar')
    document.getElementById('statusbardisplay').innerHTML = '<button id="toggleStatusBarButton" onclick="hideStatusBar()">Hide Status Bar Window</button>'
}

function hideStatusBar(){
    ipcRenderer.send('hideStatusBar')
    document.getElementById('statusbardisplay').innerHTML = '<button id="toggleStatusBarButton" onclick="showStatusBar()">Show Status Bar Window</button>'
}