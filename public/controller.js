var app=angular.module('myApp',['ngResource','ngRoute','ngFileUpload']);
app.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
			when('/route1',{
				templateUrl:'employees.html',
				controller:'myCtrl'
			}).
			when('/route2/:param',{
				templateUrl:'edit.html',
				controller:'editCtrl'
			}).
			when('/route3',{
				templateUrl:'createNew.html',
				controller:'createCtrl'
			}).
			when('/route4',{
				templateUrl:'directReports.html',
				controller:'drCtrl'
			}).
			when('/route5/:param',{
				templateUrl:'detail.html',
				controller:'viewCtrl'
			}).
			otherwise({
				resirectTo:'/'
			});
	}]);
app.service('theService', function($http,$q){
	var indexes=[];
	this.getAllEmployees=function(){
		return $http.get('/employees');
			// .then(function(response){
			// 	return response;
			// });
	};
	this.getOneEmployee=function(index){
		return $http.get('/employees/'+index)
			.then(function(response){
				return response;
			});
	};
});
app.controller('myCtrl',function($scope,theService,$http,$q){
	$scope.getAll=function(){
		theService.getAllEmployees().then(function(response){
			$scope.employees=response.data;
		});
	};
	$scope.getAll();
	$scope.viewDR=function(idx){
		theService.indexes=idx;
		console.log("typeof(idx):::"+typeof(idx));
		console.log("typeof(theService.indexes):::"+typeof(theService.indexes));
		window.location="#/route4";
	}
});
app.controller('editCtrl',function($scope,theService,$routeParams,$http,$q,Upload){
	// ******image upload
	var vm=this;
	vm.submit = function(){ //function to call on form submit
        if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
            vm.upload(vm.file); //call upload function
        }
    }
    
    vm.upload = function (file) {
        Upload.upload({
            url: 'http://localhost:8080/upload', //webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if(resp.data.error_code === 0){ //validate success
                alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
            } else {
                alert('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            alert('Error status: ' + resp.status);
        }, function (evt) { 
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };


	var cur_id;
	cur_id = $routeParams.param;
	console.log("$routeParams.param:::::"+$routeParams.param);
	console.log("cur_id:::::"+cur_id);
	$scope.getOne=function(index){
		theService.getOneEmployee(index).then(function(response){
			$scope.employee=response.data;
			$scope.firstName=response.data.firstName;
			$scope.lastName=response.data.lastName;
			$scope.title=response.data.title;
			$scope.gender=response.data.gender;
        	$scope.age=response.data.age;
        	$scope.startDate=response.data.startDate;
			$scope.managerID=response.data.managerID;
			$scope.directReports=response.data.directReports.length;
			$scope.officePhone=response.data.officePhone;
			$scope.cellPhone=response.data.cellPhone;
			$scope.sms=response.data.sendMessage;
			$scope.email=response.data.email;
			
			var id=response.data.managerID;
			console.log("idddd"+id);
			if(id.length==0){
				$scope.managerName="None";
			}else{
				$scope.managerName=theService.getOneEmployee(id).then(function(response){
					$scope.managerName=response.data.firstName+" "+response.data.lastName;
				});
			};
			$scope.employees=theService.getAllEmployees().then(function(response){
				$scope.employees=response.data;
			});
			
		});
	};
	$scope.getOne(cur_id);
	$scope.save=function(){
		var curUser={};
		curUser.firstName=$scope.firstName;
		curUser.lastName=$scope.lastName;
		curUser.title=$scope.title;
		curUser.gender=$scope.gender;
        curUser.age=$scope.age;
        curUser.startDate=$scope.startDate;
		curUser.managerID=$scope.selectedManager._id;
		curUser.officePhone=$scope.officePhone;
		curUser.cellPhone=$scope.cellPhone;
		curUser.sendMessage=$scope.sms;
		curUser.email=$scope.email;
		curUser.directReports=[];
		$http.put('/employees/'+cur_id,curUser).success(function(response){
			alert('Change save successfully!!');
			window.location="#/route1";
		});
	};
	$scope.delete=function(){
		$http.delete('/employees/'+cur_id).success(function(response){
			alert('delete successfully');
			window.location="#/route1";
		});
	};
});
app.controller('createCtrl',function($scope,theService,$http,$q,Upload){
	// ******image upload
	var vm=this;
	 vm.submit = function(){ //function to call on form submit
        if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
            vm.upload(vm.file); //call upload function
        }
    }
    
    vm.upload = function (file) {
        Upload.upload({
            url: 'http://localhost:8080/upload', //webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if(resp.data.error_code === 0){ //validate success
                alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
            } else {
                alert('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            alert('Error status: ' + resp.status);
        }, function (evt) { 
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };

    $scope.getAll=function(){
		theService.getAllEmployees().then(function(response){
			$scope.employees=response.data;
		});
	};
	$scope.getAll();

	$scope.createNew=function(){
		var newUser={};
		newUser={firstName:$scope.firstName,lastName:$scope.lastName,title:$scope.title,gender:$scope.gender,age:$scope.age,startDate:$scope.startDate,officePhone:$scope.officePhone,cellPhone:$scope.cellPhone,sendMessage:$scope.sms,email:$scope.email,managerID:$scope.managerID};
		$http.post('/employees',newUser).success(function(response){
			alert('Create successfully!!');
			window.location="#/route1";
		});
	};
});
app.controller('drCtrl',function($scope,theService,$routeParams,$http,$q){
	console.log("route 4 theService indexes:::"+theService.indexes);
	console.log("route 4 theService length:::"+theService.indexes.length);
	$scope.employees=[];
	$scope.getDR=function(ids){
		for(var i=0;i<ids.length;i++){
			console.log("ids[i]:::"+ids[i]);
			theService.getOneEmployee(ids[i]).then(function(response){
				console.log("11111");
				console.log("response.data.firstName:::"+response.data.firstName);
				console.log("response.data.lastName:::"+response.data.lastName);

				$scope.employees.push(response.data);
				console.log("$scope.employees.length:::"+$scope.employees.length);
			});
		};
	};
	$scope.getDR(theService.indexes);
});
app.controller('viewCtrl',function($scope,theService,$routeParams,$http,$q){
	var cur_id;
	cur_id = $routeParams.param;
	console.log("$routeParams.param:::::"+$routeParams.param);
	console.log("cur_id:::::"+cur_id);

	$scope.getOne=function(index){
		theService.getOneEmployee(index).then(function(response){
			$scope.employee=response.data;
			theService.indexes=response.data.directReports;
		
			var id=response.data.managerID;
			console.log("idddd"+id);
			if(id.length==0){
				$scope.managerName="None";
			}else{
				$scope.managerName=theService.getOneEmployee(id).then(function(response){
					$scope.managerName=response.data.firstName+" "+response.data.lastName;
					console.log("hahhahahhahah"+response.data.firstName);
				});
			};
		});
	};
	$scope.getOne(cur_id);
	$scope.viewDR=function(){
		console.log("typeof(theService.indexes):::"+typeof(theService.indexes));
		window.location="#/route4";
	};
});



