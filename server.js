var express    = require('express');                       
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var path = require('path');
var session = require('express-session');

var app= express(); 
// ********for image upload
var multer=require('multer');
//********for image upload
app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

// connect database and add data table
var Employee    = require('./models/employee');

var mongoose   = require('mongoose');
mongoose.connect('mongodb://summer18021:4486qqcom@jello.modulusmongo.net:27017/huGu7tug'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;  

app.use('/', express.static(path.join(__dirname+'/public')));

var picName;
var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './public/uploads');
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
            picName=file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
            console.log(picName);
            console.log("type of picName"+typeof(picName));
        }
    });
var upload=multer({storage:storage}).single('file');

//********upload image
app.post('/upload', function(req, res) {
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            };
            res.json({error_code:0,err_desc:null});
        });
    });

// get all users
app.get('/employees', function(req, res) {
    Employee.find(function(err, employees){
        if(err) res.send(err);
        res.json(employees);
    })
    // .limit(3)
    // .skip(3)
      // ng-infinite-scroll
      //req.query.id
      //app.module('infinite-scroll').value('THROTTLE_MILLISECONDS',250)

      //http.get('/employees',{params:{currentPage:currentPage}})

      //<div infinite-scroll="loadmore()">
      //<table></table>
      //</div>
    //用ng-hide ng-show 来filter

});

// get one with id
app.get('/employees/:employee_id',function(req, res) {
    Employee.findById(req.params.employee_id, function(err, employee) {
        if (err)
            res.send(err);
        res.json(employee);
        console.log("server employee.gender"+employee.gender);
    });
});

// create new user
app.post('/employees',function(req, res) { 
    var staff = new Employee(); 
    staff.picName=picName;     
    staff.firstName = req.body.firstName;  
    staff.lastName=req.body.lastName;
    staff.title=req.body.title;
    staff.gender=req.body.gender;
    staff.age=req.body.age;
    staff.startDate=req.body.startDate;
    staff.officePhone=req.body.officePhone;
    staff.cellPhone=req.body.cellPhone;
    staff.sendMessage=req.body.sendMessage;
    staff.email=req.body.email;
    staff.managerID="";
    console.log("type of staff.managerID:::"+typeof(staff.managerID));
    if(typeof(req.body.managerID)!=='undefined'){
        staff.managerID=req.body.managerID;
    } 
    staff.directReports=[];
    console.log(req.body);

    console.log("req.body.managerID1"+req.body.managerID);

    // insert new employee record
    staff.save(function(err) {
        if (err)
            res.send(err);
        res.json({ message: 'Staff created!' });
    });
    console.log("staff._id 111  :"+staff._id);
    
    var len=staff.managerID.length;
    // if(typeof(staff.managerID)=="undefinded"){
    //     len=0;
    // }else{
    //     len=staff.managerID.length;
    // }
    if (len!=0){
        console.log("staff.managerID"+staff.managerID);
        //update manager's directRecords
        Employee.findById(staff.managerID,function(err,manager){
            if (err)
                res.send(err);
            manager.directReports.push(staff._id);
            console.log("staff._id 222  :"+staff._id);
            manager.save();
        });
    };
});


// delete one with id
app.delete('/employees/:employee_id',function(req, res) {
    Employee.findById(req.params.employee_id,function(err,staff){
        if (err) res.send(err);
        //user has no manager and no directReports
        var len1=staff.directReports.length;
        var len2=staff.managerID.length;
        console.log('len1='+len1);
        console.log('len2='+len2);
        if(len1==0 && len2==0){
            Employee.remove({ _id: req.params.employee_id}, function(err, employee) {
                if (err)
                    res.send(err);
                res.json({ message: 'Successfully deleted' });
            });
            console.log("1111111");

        //user has manager, has no directReports
        }else if(len1==0 && len2!=0){
            Employee.findById(staff.managerID,function(err,manager){
                var index=manager.directReports.indexOf(req.params.employee_id);
                console.log("index="+index);
                manager.directReports.splice(index,1);
                manager.save();
                console.log(manager.directReports);
                Employee.remove({ _id: req.params.employee_id}, function(err, employee) {
                    if (err)
                        res.send(err);
                    res.json({ message: 'Successfully deleted' });
                });
            });
            console.log("2222222");

         // user has no manager, has directReports
         }else if(len1!=0 && len2==0){
            for(var i=0;i<len1;i++){
                Employee.findById(staff.directReports[i],function(err,eachOne){
                    if (err) res.send(err);
                    eachOne.managerID="";
                    eachOne.save();
                });
            };
            Employee.remove({ _id: req.params.employee_id}, function(err, employee) {
                if (err) res.send(err);
                res.json({ message: 'Successfully deleted' });
                console.log("33333333");
            });
           
         //user has manager, also has directReports
         }else if(len1!=0 && len2!=0){
            
            Employee.findById(staff.managerID,function(err,manager){
                if (err) res.send(err);
                var index=manager.directReports.indexOf(req.params.employee_id);
                console.log("index="+index);
                manager.directReports.splice(index,1);

                for(var i=0;i<len1;i++){
                    Employee.findById(staff.directReports[i],function(err,eachOne){
                        if (err) res.send(err);
                        eachOne.managerID=staff.managerID;
                        manager.directReports.push(eachOne._id);
                    });
                };

                manager.save();
            });
            Employee.remove({ _id: req.params.employee_id}, function(err, employee) {
                if (err) res.send(err);
                res.json({ message: 'Successfully deleted' });
                console.log("444444");
            });
         };
    });
});

// app.delete('/employees/:employee_id',function(req, res) {
//     Employee.remove({ _id: req.params.employee_id}, function(err, employee) {
//                 if (err) res.send(err);
//                 res.json({ message: 'Successfully deleted' });
//                 console.log("444444");
//             });
// });

// update one with id
app.put('/employees/:employee_id',function(req, res) {
    // use our employee model to find the employee we want
    Employee.findById(req.params.employee_id, function(err, employee) {
        if (err)
            res.send(err);
        var managerBefore=employee.managerID;
        employee.picName=employee.picName;
        if(employee.picName!=picName){
            employee.picName=picName;
        };
        employee.firstName = req.body.firstName; 
        employee.lastName = req.body.lastName;  
        employee.title=req.body.title;
        employee.gender=req.body.gender;
        employee.age=req.body.age;
        employee.startDate=req.body.startDate;
        employee.officePhone=req.body.officePhone;
        employee.cellPhone=req.body.cellPhone;
        employee.sendMessage=req.body.sendMessage;
        employee.email=req.body.email;
        employee.managerID=req.body.managerID;
        employee.directReports=employee.directReports;  // update the employees info

        //save the employee
        employee.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Employee updated!' });
        });
        //no change of manager, nothing need to do extra
        //no manager --> has manager, update manager's directReports
        if(managerBefore.length==0 && employee.managerID!=0){
            //update manager's directRecords
            Employee.findById(employee.managerID,function(err,manager){
                if (err)
                    res.send(err);
                manager.directReports.push(employee._id);
                manager.save();
            });
        }else if(managerBefore.length!=0 && employee.managerID==0){
            //update manager's directReports
            Employee.findById(managerBefore,function(err,manager){
                var index=manager.directReports.indexOf(employee._id);
                console.log("index="+index);
                manager.directReports.splice(index,1);
                manager.save();
            });
        }else if(managerBefore!=employee.managerID){
            //update manager's directRecords
            Employee.findById(employee.managerID,function(err,manager1){
                if (err)
                    res.send(err);
                manager1.directReports.push(employee._id);
                manager1.save();
            });
            //update manager's directReports
            Employee.findById(managerBefore,function(err,manager2){
                var index=manager2.directReports.indexOf(employee._id);
                console.log("index="+index);
                manager2.directReports.splice(index,1);
                manager2.save();
            });
        };

        
    });
});


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
