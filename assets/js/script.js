   app = angular.module("newApp", ['ngMaterial','ngRoute','ngAria'])
   .config(function($routeProvider) {
      $routeProvider
      .when("/", {
        templateUrl: "./templates/home.html"
      }) 
      .when("/auth", {
        templateUrl: "./templates/Authenticate.html"
      }) 
      .when("/create", {
        templateUrl: "./templates/create.html"
      })
      .when("/updateAds/:id", {
        templateUrl: "./templates/updAds.html",
        controller: 'updateDoc'
      })
      .when("/archive", {
        templateUrl: "./templates/archive.html"
      });
    }).run(function(){
      console.log("newApp is running!");
    });


  // ----------------- Authentication --------------------

  // PyJWT Exercise
  app.controller('PyJWT', function($scope, $http) {

    $scope.passData = function() {    
      var send_data = {
        "email" : $scope.email,
        "password" : $scope.pwd
      }
      
      $http({
        url: 'http://black-widow.remotestaff.com/falcon/auth/01/admin',
        method: 'POST',
        data: send_data
      })
      .then(function(response) {
        if (response.status == 200) {
          $scope.token = response.data.jwt;
          console.log($scope.token);
          // console.log(send_data);

          // Pass Token to falcon
          $http.post("/falcon/authData/",JSON.stringify($scope.token));

          // Get Decoded Data from falcon
          $http.post("/falcon/authData/",JSON.stringify($scope.token)).then(function(result){
            // console.log(result);
            $scope.dataToken = result;
            console.log($scope.dataToken.data.admin_email);
            console.log($scope.email);
            
            if($scope.dataToken.data.admin_email == $scope.email) {

              console.log("Success !!!!");
              // Change Route When Success
              window.location.href = '../angular2/'
              alert("Login Success");
            } 
          });
        }
        // console.log("dsfdsfdgf");
      }).catch(function(error) {
        $scope.token = 'unauthorized'
        console.log(error);
        alert("Login Failed");
      });
    }
  });

  //------------------- Retrieve Data ----------------------
  // Display Active Documents
    app.controller('DisplayAllDocs', function($scope, $http, $mdDialog) {

      // Get Data from Couch -> stored in details
      $http.get("/falcon/viewActiveNew").then(function(data){
        $scope.details = data.data;
        // console.log($scope.details);
      });

      // Get Choosen Doc ID
      $scope.passNewID = {}
      $scope.getId = function(newId) {
        $scope.passNewID.key = ""
        $scope.passNewID = newId;

        $http.get('/falcon/getSelectedDatas/'+$scope.passNewID, JSON.stringify($scope.passNewID));
        $http.get("/falcon/getSelectedDatas/"+$scope.passNewID).then(function(result){
          $scope.selectedID = result;
        });
      };

      $scope.showAdvanced = function(sent_ID) {
        console.log(sent_ID);
        $scope.passNewID = {}
        $scope.passNewID.key = ""
        $scope.passNewID = sent_ID;

        $http.get('/falcon/getSelectedDatas/'+$scope.passNewID, JSON.stringify($scope.passNewID));
        $http.get("/falcon/getSelectedDatas/"+$scope.passNewID).then(function(result){
          $scope.selectedDoc = result;
          // console.log($scope.selectedDoc);

        $mdDialog.show({
          controller: DialogController,
          templateUrl: './templates/dialogContent.html',
          parent: angular.element(document.body),
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });

        function DialogController($scope, $mdDialog) {
          $scope.SelectedDoc = result;
          // console.log($scope.selectedDoc);
          console.log(result);

          $scope.hide = function() {
            $mdDialog.hide();
          };

          $scope.cancel = function() {
            $mdDialog.cancel();
          };

          $scope.answer = function(answer) {
            $mdDialog.hide(answer);
          };
        }
        });
      };

    });

    // Archive
    // Displays Archive Documents
    app.controller('arcList', function($scope,$http){

      $http.get("/falcon/viewArchive").then(function(data){
        $scope.arcList = data.data;
        // console.log($scope.details);
        // console.log("sdsdsad");
      });

      $scope.showAdvanced = function(ev, sent_data) {
        $scope.disDoc = SelectedData;
        $scope.disDoc.data = sent_data;

        $mdDialog.show({
          controller: DialogController,
          templateUrl: './templates/dialogContent.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });

        function DialogController($scope, $mdDialog) {
          $scope.disDoc=SelectedData;

          $scope.hide = function() {
            $mdDialog.hide();
          };

          $scope.cancel = function() {
            $mdDialog.cancel();
          };

          $scope.answer = function(answer) {
            $mdDialog.hide(answer);
          };
        }
        // console.log($scope.disDoc.data);
      };


/*
      // Get Choosen Doc ID
      $scope.passNewID = {}
      $scope.getId = function(newId) {
        $scope.passNewID.key = ""
        $scope.passNewID = newId;
        // console.log("Choosen ID : "+newId);

        // console.log($scope.passNewID);
        // $http.post("http://localhost:8000/falcon/getSelectedData",($scope.passNewID));
        // console.log(JSON.stringify($scope.passNewID));

        $http.get('/falcon/getSelectedDatas/'+$scope.passNewID, JSON.stringify($scope.passNewID));
        $http.get("/falcon/getSelectedDatas/"+$scope.passNewID).then(function(result){
          $scope.selectedID = result;
          // console.log($scope.selectedID);
        });
      };*/
    });



    //-------------------Update Jobspecs --------------------
    // Dialog button for Edit Job Order
    app.controller('RSR', function($scope, SelectedData) {

      $scope.ratings = [
      {name:'Beginner'},
      {name:'Intermediate'},
      {name:'Advanced'}
      ];

      $scope.disDoc = SelectedData;
      // console.log($scope.disDoc.data);
    });

    app.controller('dialogCtrl', function($scope, $mdDialog){
      $scope.status = '  ';
      $scope.customFullscreen = false;

      $scope.showPrompt = function(ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.prompt()
        .title('Add Requirements')
        .textContent('')
        .placeholder('Requirement\'s Name ')
        .ariaLabel('Dog name')
        .initialValue('')
        .targetEvent(ev)
        .required(true)
        .ok('OK')
        .cancel('Cancel');

        $mdDialog.show(confirm).then(function(result) {
          $scope.status = result;
        }, function() {
          $scope.status = 'You didn\'t name your dog.';
        });
      };
    });

  //----------- Create Jobspec ----------------- 
  app.controller('createDoc', function($scope, $http){

    // Values for Select Fields
    $scope.jobcat = [
      { category: 'A & B', name: 'MYOB' },
      { category: 'A & B', name: 'QuickBooks' },
      { category: 'A & B', name: 'Peachtree' },
      { category: 'A & B', name: 'Oracle' },
      { category: 'A & B', name: 'General Accounting' },
      { category: 'A & B', name: 'SAP' },
      { category: 'A & B', name: 'Bookkeping' },
      { category: 'A & B', name: 'Xero' },
      { category: 'Adm', name: 'Collections Proffesionals' },
      { category: 'Adm', name: 'Data Entry' },
      { category: 'Adm', name: 'Technical Support' },
      { category: 'Adm', name: 'Customer Support' },
      { category: 'Adm', name: 'Recruitment' },
      { category: 'Adm', name: 'Transcription' },
      { category: 'Adm', name: 'Back-Office Admin' },
      { category: 'Adm', name: 'Human Resources' },
      { category: 'Adm', name: 'Legal' },
      { category: 'B A', name: 'Business Analysis' },
      { category: 'B A', name: 'Business Plans' },
      { category: 'B A', name: 'Project Management' },
      { category: 'C S', name: 'Outboubd Surveyors' },
      { category: 'C S', name: 'Chat Support' },
      { category: 'C S', name: 'IT HelpDesk' },
      { category: 'C S', name: 'Technical Support' },
      { category: 'C S', name: 'Phone Support' },
      { category: 'C S', name: 'Email Support' },
      { category: 'D & M', name: 'Print Graphic Designers' },
      { category: 'D & M', name: 'Graphic Design' },
      { category: 'D & M', name: 'Web Design' },
      { category: 'D & M', name: '3D Modelling & CAD' },
      { category: 'D & M', name: 'Video Editing' },
      { category: 'D & M', name: 'Illustration' },
      { category: 'Eng', name: 'Electrical Engineering' },
      { category: 'Eng', name: 'Mechanical Engineering' },
      { category: 'Eng', name: 'Civil Engineering' },
      { category: 'Eng', name: 'Quantity Surveying' },
      { category: 'M D', name: 'iOS Development' },
      { category: 'M D', name: 'Android Development' },
      { category: 'M D', name: 'Windows-Based Platform Development' },
      { category: 'M D', name: 'Cross Platform Development' },
      { category: 'M C S', name: 'French Language Experts' },
      { category: 'M C S', name: 'German Language Experts' },
      { category: 'M C S', name: 'Italian Language Experts' },
      { category: 'M C S', name: 'Portuguese Language Experts' },
      { category: 'M C S', name: 'Spanish Language Experts' },
      { category: 'M C S', name: 'Russian Language Experts' },
      { category: 'M C S', name: 'Cantonese Language Experts' },
      { category: 'M C S', name: 'Hokkien Language Experts' },
      { category: 'M C S', name: 'Mandarin Language Experts' },
      { category: 'M C S', name: 'Nipponggo Language Experts' },
      { category: 'Net', name: 'Microsoft Certified' },
      { category: 'Net', name: 'Network Administration' },
      { category: 'Net', name: 'Cisco Certified ' },
      { category: 'Net', name: 'Database Administration' },
      { category: 'Net', name: 'Network Operations Centre Engineers ' },
      { category: 'Net', name: 'Server Administration' },
      { category: 'Net', name: 'Google Specialists' },
      { category: 'Net', name: 'System Administration' },
      { category: 'Net', name: 'Systems Analysis' },
      { category: 'O T', name: 'English Teachers' },
      { category: 'S & M', name: 'Search Engine Optimization Specialists' },
      { category: 'S & M', name: 'Search Engine Management Specialists' },
      { category: 'S & M', name: 'Inbound Sales' },
      { category: 'S & M', name: 'Outbound Sales ' },
      { category: 'S & M', name: 'Link Building' },
      { category: 'S & M', name: 'Lead Generation' },
      { category: 'S & M', name: 'Social Media Marketing' },
      { category: 'S & M', name: 'Telemarketing' },
      { category: 'S & M', name: 'Internet Marketing' },
      { category: 'S & M', name: 'Lead Mining' },
      { category: 'S & M', name: 'Appointment Setting' },
      { category: 'S & M', name: 'Purchasing Assistants' },
      { category: 'S D', name: '.NET Framework Developers and Programmers' },
      { category: 'S D', name: 'Game Development' },
      { category: 'S D', name: 'Software QA & Testing' },
      { category: 'S D', name: 'C++ Development' },
      { category: 'S D', name: 'C# Development' },
      { category: 'S D', name: 'Java Development' },
      { category: 'S D', name: 'Software Application Development' },
      { category: 'V A', name: 'Marketing Assistance' },
      { category: 'V A', name: 'Personal Assistance' },
      { category: 'V A', name: 'Technical Assistance' },
      { category: 'V A', name: 'Legal Assistance' },
      { category: 'V A', name: 'Financial Assistance' },
      { category: 'V A', name: 'Executive Assistance' },
      { category: 'W D', name: 'PHP Development' },
      { category: 'W D', name: 'Flash Development' },
      { category: 'W D', name: 'Front-End Development' },
      { category: 'W D', name: 'Web QA & Testing' },
      { category: 'W D', name: 'Java Development' },
      { category: 'W D', name: 'Ruby-On-Rails Development' },
      { category: 'W D', name: 'Magento Development' },
      { category: 'W D', name: 'ASP Development' },
      { category: 'W D', name: 'Python Development' },
      { category: 'W D', name: 'Node.JS Development' },
      { category: 'W D', name: 'WordPress Development' },
      { category: 'W D', name: 'Joomla Development' },
      { category: 'W D', name: 'User Interface Designs' },
      { category: 'W D', name: 'Drupal Development' },
      { category: 'Wri', name: 'Web Content and Articles' },
      { category: 'Wri', name: 'Technical and Manual Writing' },
      { category: 'Wri', name: 'Blogging' },
      { category: 'Wri', name: 'Sales and Business Marketing Writers' },
      { category: 'Wri', name: 'SEO Writing' }];

    $scope.jobClass = [
      { name: 'I.T.'},
      { name: 'Non I.T.'}
      ];

    $scope.OM = [
      { name : 'Home Office' },
      { name : 'Office Location' },
      { name : 'Project Based' }
      ];

    $scope.jobComp = [
      { name: 'RemoteStaff Inc.' },
      { name: 'RemoteStaff client' },
      { name: 'Realestate.ph' }
    ];

    $scope.jobStatus = [
      { name: 'New' },
      { name: 'Archive' },
      { name: 'Active' }
    ];

    $scope.jobShowStatus = [
      { name: 'Yes' },
      { name: 'No' }];

    // Job Order Select Tags
    $scope.job_order_level = [
      {name:'Ful-Time 9 hrs w/1hr break'},
      {name:'Part Time 4hrs'}
    ];

    $scope.work_status = [
      {name:'Entry (1-3 years)'},
      {name:'Mid Level (3-5 years)'},
      {name:'Expert (More than 5 years)'}
    ];

    // Working Status Values 227 Lines
    $scope.working_time_zone = [
      {name: 'Africa/Johannesburg'},
      {name: 'America/Adak'},
      {name: 'America/Anchorage'},
      {name: 'America/Anguilla'},
      {name: 'America/Antigua'},
      {name: 'America/Araguaina'},
      {name: 'America/Argentina/Buenos_Aires'},
      {name: 'America/Argentina/Catamarca'},
      {name: 'America/Argentina/Cordoba'},
      {name: 'America/Argentina/Jujuy'},
      {name: 'America/Argentina/La_Rioja'},
      {name: 'America/Argentina/Mendoza'},
      {name: 'America/Argentina/Rio_Gallegos'},
      {name: 'America/Argentina/Salta'},
      {name: 'America/Argentina/San_Juan'},
      {name: 'America/Argentina/San_Luis'},
      {name: 'America/Argentina/Tucuman'},
      {name: 'America/Argentina/Ushuaia'},
      {name: 'America/Aruba'},
      {name: 'America/Asuncion'},
      {name: 'America/Atikokan'},
      {name: 'America/Bahia'},
      {name: 'America/Bahia_Banderas'},
      {name: 'America/Barbados'},
      {name: 'America/Belem'},
      {name: 'America/Belize'},
      {name: 'America/Blanc-Sablon'},
      {name: 'America/Boa_Vista'},
      {name: 'America/Bogota'},
      {name: 'America/Boise'},
      {name: 'America/Cambridge_Bay'},
      {name: 'America/Campo_Grande'},
      {name: 'America/Cancun'},
      {name: 'America/Caracas'},
      {name: 'America/Cayenne'},
      {name: 'America/Cayman'},
      {name: 'America/Chicago'},
      {name: 'America/Chihuahua'},
      {name: 'America/Costa_Rica'},
      {name: 'America/Creston'},
      {name: 'America/Cuiaba'},
      {name: 'America/Curacao'},
      {name: 'America/Danmarkshavn'},
      {name: 'America/Dawson'},
      {name: 'America/Dawson_Creek'},
      {name: 'America/Denver'},
      {name: 'America/Detroit'},
      {name: 'America/Dominica'},
      {name: 'America/Edmonton'},
      {name: 'America/Eirunepe'},
      {name: 'America/El_Salvador'},
      {name: 'America/Fortaleza'},
      {name: 'America/Glace_Bay'},
      {name: 'America/Godthab'},
      {name: 'America/Goose_Bay'},
      {name: 'America/Grand_Turk'},
      {name: 'America/Grenada'},
      {name: 'America/Guadeloupe'},
      {name: 'America/Guatemala'},
      {name: 'America/Guayaquil'},
      {name: 'America/Guyana'},
      {name: 'America/Halifax'},
      {name: 'America/Havana'},
      {name: 'America/Hermosillo'},
      {name: 'America/Indiana/Indianapolis'},
      {name: 'America/Indiana/Knox'},
      {name: 'America/Indiana/Marengo'},
      {name: 'America/Indiana/Petersburg'},
      {name: 'America/Indiana/Tell_City'},
      {name: 'America/Indiana/Vevay'},
      {name: 'America/Indiana/Vincennes'},
      {name: 'America/Indiana/Winamac'},
      {name: 'America/Inuvik'},
      {name: 'America/Iqaluit'},
      {name: 'America/Jamaica'},
      {name: 'America/Juneau'},
      {name: 'America/Kentucky/Louisville'},
      {name: 'America/Kentucky/Monticello'},
      {name: 'America/Kralendijk'},
      {name: 'America/La_Paz'},
      {name: 'America/Lima'},
      {name: 'America/Los_Angeles'},
      {name: 'America/Louisville'},
      {name: 'America/Lower_Princes'},
      {name: 'America/Maceio'},
      {name: 'America/Managua'},
      {name: 'America/Manaus'},
      {name: 'America/Marigot'},
      {name: 'America/Martinique'},
      {name: 'America/Matamoros'},
      {name: 'America/Mazatlan'},
      {name: 'America/Menominee'},
      {name: 'America/Merida'},
      {name: 'America/Metlakatla'},
      {name: 'America/Mexico_City'},
      {name: 'America/Miquelon'},
      {name: 'America/Moncton'},
      {name: 'America/Monterrey'},
      {name: 'America/Montevideo'},
      {name: 'America/Montreal'},
      {name: 'America/Montserrat'},
      {name: 'America/Nassau'},
      {name: 'America/New_York'},
      {name: 'America/Nipigon'},
      {name: 'America/Nome'},
      {name: 'America/Noronha'},
      {name: 'America/North_Dakota/Beulah'},
      {name: 'America/North_Dakota/Center'},
      {name: 'America/North_Dakota/New_Salem'},
      {name: 'America/Ojinaga'},
      {name: 'America/Panama'},
      {name: 'America/Pangnirtung'},
      {name: 'America/Paramaribo'},
      {name: 'America/Phoenix'},
      {name: 'America/Port_of_Spain'},
      {name: 'America/Port-au-Prince'},
      {name: 'America/Porto_Velho'},
      {name: 'America/Puerto_Rico'},
      {name: 'America/Rainy_River'},
      {name: 'America/Rankin_Inlet'},
      {name: 'America/Recife'},
      {name: 'America/Regina'},
      {name: 'America/Resolute'},
      {name: 'America/Rio_Branco'},
      {name: 'America/Santa_Isabel'},
      {name: 'America/Santarem'},
      {name: 'America/Santiago'},
      {name: 'America/Santo_Domingo'},
      {name: 'America/Sao_Paulo'},
      {name: 'America/Scoresbysund'},
      {name: 'America/Shiprock'},
      {name: 'America/Sitka'},
      {name: 'America/St_Barthelemy'},
      {name: 'America/St_Johns'},
      {name: 'America/St_Kitts'},
      {name: 'America/St_Lucia'},
      {name: 'America/St_Thomas'},
      {name: 'America/St_Vincent'},
      {name: 'America/Swift_Current'},
      {name: 'America/Tegucigalpa'},
      {name: 'America/Thule'},
      {name: 'America/Thunder_Bay'},
      {name: 'America/Tijuana'},
      {name: 'America/Toronto'},
      {name: 'America/Tortola'},
      {name: 'America/Vancouver'},
      {name: 'America/Whitehorse'},
      {name: 'America/Winnipeg'},
      {name: 'America/Yakutat'},
      {name: 'America/Yellowknife'},
      {name: 'Asia/Bangkok'},
      {name: 'Asia/Kolkata'},
      {name: 'Asia/Manila'},
      {name: 'Asia/Singapore'},
      {name: 'Australia/Adelaide'},
      {name: 'Australia/Brisbane'},
      {name: 'Australia/Broken_Hill'},
      {name: 'Australia/Currie'},
      {name: 'Australia/Darwin'},
      {name: 'Australia/Eucla'},
      {name: 'Australia/Hobart'},
      {name: 'Australia/Lindeman'},
      {name: 'Australia/Lord_Howe'},
      {name: 'Australia/Melbourne'},
      {name: 'Australia/Perth'},
      {name: 'Australia/Queensland'},
      {name: 'Australia/Sydney'},
      {name: 'Europe/Amsterdam'},
      {name: 'Europe/Andorra'},
      {name: 'Europe/Athens'},
      {name: 'Europe/Belgrade'},
      {name: 'Europe/Berlin'},
      {name: 'Europe/Bratislava'},
      {name: 'Europe/Brussels'},
      {name: 'Europe/Bucharest'},
      {name: 'Europe/Budapest'},
      {name: 'Europe/Busingen'},
      {name: 'Europe/Chisinau'},
      {name: 'Europe/Copenhagen'},
      {name: 'Europe/Dublin'},
      {name: 'Europe/Gibraltar'},
      {name: 'Europe/Guernsey'},
      {name: 'Europe/Helsinki'},
      {name: 'Europe/Isle_of_Man'},
      {name: 'Europe/Istanbul'},
      {name: 'Europe/Jersey'},
      {name: 'Europe/Kaliningrad'},
      {name: 'Europe/Kiev'},
      {name: 'Europe/Lisbon'},
      {name: 'Europe/Ljubljana'},
      {name: 'Europe/London'},
      {name: 'Europe/Luxembourg'},
      {name: 'Europe/Madrid'},
      {name: 'Europe/Malta'},
      {name: 'Europe/Mariehamn'},
      {name: 'Europe/Minsk'},
      {name: 'Europe/Monaco'},
      {name: 'Europe/Moscow'},
      {name: 'Europe/Nicosia'},
      {name: 'Europe/Oslo'},
      {name: 'Europe/Paris'},
      {name: 'Europe/Podgorica'},
      {name: 'Europe/Prague'},
      {name: 'Europe/Riga'},
      {name: 'Europe/Rome'},
      {name: 'Europe/Samara'},
      {name: 'Europe/San_Marino'},
      {name: 'Europe/Sarajevo'},
      {name: 'Europe/Simferopol'},
      {name: 'Europe/Skopje'},
      {name: 'Europe/Sofia'},
      {name: 'Europe/Stockholm'},
      {name: 'Europe/Tallinn'},
      {name: 'Europe/Tirane'},
      {name: 'Europe/Uzhgorod'},
      {name: 'Europe/Vaduz'},
      {name: 'Europe/Vatican'},
      {name: 'Europe/Vienna'},
      {name: 'Europe/Vilnius'},
      {name: 'Europe/Volgograd'},
      {name: 'Europe/Warsaw'},
      {name: 'Europe/Zagreb'},
      {name: 'Europe/Zaporozhye'},
      {name: 'Europe/Zurich'},
      {name: 'Pacific/Auckland'},
      {name: 'Pacific/Chatham'},
      {name: 'Pacific/Honolulu'}
    ];

    $scope.currenZ = [
          "AUD",
          "GBP",
          "USD",
          "CAD",
          "NZD"
      ];

    // Start Date Picker
    $scope.startDate = new Date();

    $scope.working_start_time_hour = [
      {name: "0"},
      {name: "1"},
      {name: "2"},
      {name: "3"},
      {name: "4"},
      {name: "5"},
      {name: "6"},
      {name: "7"},
      {name: "8"},
      {name: "9"},
      {name: "10"},
      {name: "11"},
      {name: "12"},
      {name: "13"},
      {name: "14"},
      {name: "15"},
      {name: "16"},
      {name: "17"},
      {name: "18"},
      {name: "19"},
      {name: "20"},
      {name: "21"},
      {name: "22"},
      {name: "23"},
      {name: "24"},
    ];

    $scope.working_start_time_min = [
      {name: "00"},
      {name: "30"}
    ];

    // End Working Time Values 48 lines
    $scope.working_end_time = [
      {name:'12:00 AM'},
      {name:'12:30 AM'},
      {name:'01:00 AM'},
      {name:'01:30 AM'},
      {name:'02:00 AM'},
      {name:'02:30 AM'},
      {name:'03:00 AM'},
      {name:'03:30 AM'},
      {name:'04:00 AM'},
      {name:'04:30 AM'},
      {name:'05:00 AM'},
      {name:'05:30 AM'},
      {name:'06:00 AM'},
      {name:'06:30 AM'},
      {name:'07:00 AM'},
      {name:'07:30 AM'},
      {name:'08:00 AM'},
      {name:'08:30 AM'},
      {name:'09:00 AM'},
      {name:'09:30 AM'},
      {name:'10:00 AM'},
      {name:'10:30 AM'},
      {name:'11:00 AM'},
      {name:'11:30 AM'},
      {name:'12:00 PM'},
      {name:'12:30 PM'},
      {name:'01:00 PM'},
      {name:'01:30 PM'},
      {name:'02:00 PM'},
      {name:'02:30 PM'},
      {name:'03:00 PM'},
      {name:'03:30 PM'},
      {name:'04:00 PM'},
      {name:'04:30 PM'},
      {name:'05:00 PM'},
      {name:'05:30 PM'},
      {name:'06:00 PM'},
      {name:'06:30 PM'},
      {name:'07:00 PM'},
      {name:'07:30 PM'},
      {name:'08:00 PM'},
      {name:'08:30 PM'},
      {name:'09:00 PM'},
      {name:'09:30 PM'},
      {name:'10:00 PM'},
      {name:'10:30 PM'},
      {name:'11:00 PM'},
      {name:'11:30 PM'}
    ];

    // --- Adding & Removing Columns ---
    //  ------ Requirements -------
    $scope.reqColumns = [{name:''}];
    $scope.addNewReqColumn = function() {
      var newItemNo = $scope.reqColumns.length+1;
      $scope.reqColumns.push({});
    };
    $scope.removeReqColumn = function(index) {
      // remove the row specified in index
      $scope.reqColumns.splice( index, 1);
    };
    $scope.reqCol = {}

    //  ------ Requirements Good to Have -------
    $scope.reqMHColumns = [{name:''}];
    $scope.addNewReqMHColumn = function() {
      var newItemNo = $scope.reqMHColumns.length+1;
      $scope.reqMHColumns.push({});
    };
    $scope.removeReqMHColumn = function(index) {
      // remove the row specified in index
      $scope.reqMHColumns.splice( index, 1);
    };
    $scope.reqMHCol = {}

    //  ------ Requirements Good to Have -------
    $scope.reqGTHColumns = [{name:''}];
    $scope.addNewReqGTHColumn = function() {
      var newItemNo = $scope.reqGTHColumns.length+1;
      $scope.reqGTHColumns.push({});
    };
    $scope.removeReqGTHColumn = function(index) {
      // remove the row specified in index
      $scope.reqGTHColumns.splice( index, 1);
    };
    $scope.reqGTHCol = {}

     //  ------ Requirements Tasks -------
    $scope.reqTaskColumns = [{name:''}];
    $scope.addNewReqTaskColumn = function() {
      var newItemNo = $scope.reqTaskColumns.length+1;
      $scope.reqTaskColumns.push({});
    };
    $scope.removeReqTaskColumn = function(index) {
      // remove the row specified in index
      $scope.reqTaskColumns.splice( index, 1);
    };
    $scope.reqTaskCol = {}

    //  ------ Requirement Skills -------
    $scope.reqSkillColumns = [{name:''}];
    $scope.addNewReqSkillColumn = function() {
      var newItemNo = $scope.reqSkillColumns.length+1;
      $scope.reqSkillColumns.push({});
    };
    $scope.removeReqSkillColumn = function(index) {
      // remove the row specified in index
      $scope.reqSkillColumns.splice( index, 1);
    };
    $scope.reqSkillCol = {}

   
    //  ------ Responsibilities -------
    $scope.respColumns = [{name:''}];
    $scope.addNewRespColumn = function() {
      var newItemNo = $scope.respColumns.length+1;
      $scope.respColumns.push({});
    };
    $scope.removeRespColumn = function(index) {
      // remove the row specified in index
      $scope.respColumns.splice( index, 1);
    };
    $scope.respCol = {}

     //  ------ Duties & Responsibilities -------
    $scope.dutRespColumns = [{name:''}];
    $scope.addNewDutRespColumn = function() {
      var newItemNo = $scope.dutRespColumns.length+1;
      $scope.dutRespColumns.push({});
    };
    $scope.removeDutRespColumn = function(index) {
      // remove the row specified in index
      $scope.dutRespColumns.splice( index, 1);
    };
    $scope.dutRespCol = {}

   //  ------ Other Desired Preferred Skill -------
    $scope.otherDesPreSkillColumns = [{name:''}];
    $scope.addNewOtherDesPreSkillColumn = function() {
      var newItemNo = $scope.otherDesPreSkillColumns.length+1;
      $scope.otherDesPreSkillColumns.push({});
    };
    $scope.removeOtherDesPreSkillColumn = function(index) {
      // remove the row specified in index
      $scope.otherDesPreSkillColumns.splice( index, 1);
    };
    $scope.otherDesPreSkillCol = {}


      //  ------ Add/Remove Preferred Skill -------
    $scope.PreferredSkillSet = [];
    $scope.PreferredSkillSet.preferredskills = [];
    $scope.addNewPreferredSkill = function() {
      $scope.PreferredSkillSet.preferredskills.push('');
    };
    $scope.removePreferredSkill = function(z) {
      $scope.PreferredSkillSet.preferredskills.splice(z, 1);
    };


    // // Job Role
    // $scope.JR = [
    //     "This Role is required beacuse of increased product or service demand.",
    //     "This role  will repelace a post that someone is leaving or has already left.",
    //     "This role will support current work or business requirements.",
    //     "This role is an experirement to see whether or not the company needs it.",
    //     "This role will help the company meet the needs of new products, services, or capabilities."
    // ];

    // Job Role
    $scope.jobRoles = [
      { id:1, name: "This Role is required beacuse of increased product or service demand."},
      { id:2, name: "This role  will repelace a post that someone is leaving or has already left."},
      { id:3, name: "This role will support current work or business requirements."},
      { id:4, name: "This role is an experirement to see whether or not the company needs it."},
      { id:5, name: "This role will help the company meet the needs of new products, services, or capabilities."}
    ];
/*
     $scope.save = function(){
        $scope.jobRoleNameArray = [];
        angular.forEach($scope.jobRoles, function(jr){
          if (jr.selected) $scope.jobRoleNameArray.push(jr.name);

        });
          console.log($scope.jobRoleNameArray);
       }*/

    // Store Data into an Object
    $scope.data = {}
    $scope.data.manager_info={};
    $scope.data.questions_to_be_asked={};

    // Get all Data Function
    $scope.AddDoc = function(){

      // Other Desired Prefered Skill
       // Add Column Requirements
      $scope.otherDesPreSkillCol = $scope.otherDesPreSkillColumns;
      // Remove $$hashkey
      var otherDesPreSkillCol = JSON.stringify( $scope.otherDesPreSkillCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.data.other_desired_preferred_skill = otherDesPreSkillCol;


      //  ------ Requirements -------
      // Add Column Requirements
      $scope.reqCol = $scope.reqColumns;
      // Remove $$hashkey
      var req = JSON.stringify( $scope.reqCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.requirements_data = req;
      $scope.data.requirements = $scope.requirements_data.name;


      //  ------ Requirements Must Have -------
      // Add Column Requirements
      $scope.reqMHCol = $scope.reqMHColumns;
      // Remove $$hashkey
      var reqMH = JSON.stringify( $scope.reqMHCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.data.requirements_must_have = reqMH;

      //  ------ Requirements Good to Have -------
      // Add Column Requirements
      $scope.reqGTHCol = $scope.reqGTHColumns;
      // Remove $$hashkey
      var reqGTH = JSON.stringify( $scope.reqGTHCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.data.requirements_good_to_have = reqGTH;

      //  ------ Requirements Tasks -------
      // Add Column Requirements
      $scope.reqTaskCol = $scope.reqTaskColumns;
      // Remove $$hashkey
      var reqTask = JSON.stringify( $scope.reqTaskCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.data.requirements_task = reqTask;

      //  ------ Requirement Skills -------
      // Add Column Requirements
      $scope.reqSkillCol = $scope.reqSkillColumns;
      // Remove $$hashkey
      var reqSkill = JSON.stringify( $scope.reqSkillCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.data.requirements_skills = reqSkill;

      //  ------ Responsibilities -------
      // Add Column Requirements
      $scope.respCol = $scope.respColumns;
      // Remove $$hashkey
      var respon = JSON.stringify( $scope.respCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.data.responsibilities = respon;

      //  ------ Duties & Responsibilities -------
      // Add Column Requirements
      $scope.dutRespCol = $scope.dutRespColumns;
      // Remove $$hashkey
      var dutRespon = JSON.stringify( $scope.dutRespCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.data.duties_and_responsibilities = dutRespon;

      //Job Role Storing Data From Checkbox
      $scope.jobRoleNameArray = [];
      angular.forEach($scope.jobRoles, function(jr){
        if (jr.selected) $scope.jobRoleNameArray.push(jr.name);

      });
        console.log($scope.jobRoleNameArray);

      $scope.data.job_title = $scope.job_title;
      $scope.data.leads = $scope.leads;
      $scope.data.job_position = $scope.job_position;
      $scope.data.category = $scope.cat;
      $scope.data.classification = $scope.class;
      $scope.data.outsource_model = $scope.O_model;
      $scope.data.company = $scope.comp;
      $scope.data.heading = $scope.heading;
      $scope.data.job_stat = $scope.jStat;
      $scope.data.job_show_stat = $scope.jShowStat;
      $scope.data.quantity = $scope.quantity;
      $scope.data.job_order_level = $scope.JO_level;
      $scope.data.job_order_work_stat = $scope.JO_work_stat;
      $scope.data.job_order_working_timezone = $scope.timezone;
      $scope.data.currency = $scope.currency;
      $scope.data.startDate = $scope.startDate;
      $scope.data.job_order_working_start_time = $scope.work_start;
      $scope.data.job_order_working_end_time = $scope.work_end;
      $scope.data.tell_more_about_job_role = $scope.jobRoleNameArray;
      $scope.data.special_instruction = $scope.special_inst;
      $scope.data.questions_to_be_asked.first = $scope.question1;
      $scope.data.questions_to_be_asked.second = $scope.question2;
      $scope.data.questions_to_be_asked.third = $scope.question3;
      $scope.data.will_you_provide_training = $scope.training;
      $scope.data.will_the_staff_make_calls = $scope.calls;
      $scope.data.is_this_your_first_staff_hire_for_the_job_role = $scope.first_time_hiring;
      $scope.data.will_the_staff_report_directly_to_you = $scope.report_to_you;
      $scope.data.manager_info.fullName = $scope.mngr_fullName;
      $scope.data.manager_info.email = $scope.mngr_email;
      $scope.data.manager_info.contact = $scope.mngr_contact;
      $scope.data.other_desired_preferred_skill = $scope.PreferredSkillSet.preferredskills;
      console.log($scope.data);
      // $http.post("/falcon/createDoc",JSON.stringify($scope.data));
      // console.log($scope.data);
    };
  });

  //------------------- Update JobAds ----------------------
  // Populate Fields from Choosen Document
  app.controller('updateDoc', function($scope, $routeParams){

    //Get ID out of current URL
    var currentId = $routeParams.id;
    console.log(currentId);
    console.log("currentId");

    // Populate Chossen Document into Edit Fields
    var x = JSON.parse(localStorage.getItem("lastname"));
    $scope.displayDoc = x;
    // console.log($scope.displayDoc.data);
    // console.log($scope.displayDoc.ad_job_or_title);
    $scope.upd_job_title = $scope.displayDoc.ad_job_or_title;
    $scope.QA = $scope.displayDoc.questions_to_be_asked;

    // Job Role
    $scope.jobRoles = [
      { id:1, name: "This Role is required beacuse of increased product or service demand."},
      { id:2, name: "This role  will repelace a post that someone is leaving or has already left."},
      { id:3, name: "This role will support current work or business requirements."},
      { id:4, name: "This role is an experirement to see whether or not the company needs it."},
      { id:5, name: "This role will help the company meet the needs of new products, services, or capabilities."}
    ];

    $scope.mngr_name = $scope.displayDoc.manager_info.name;
    $scope.mngr_email = $scope.displayDoc.manager_info.email;
    $scope.mngr_contact = $scope.displayDoc.manager_info.contact;

    // Values for Select Fields
    $scope.jobcat = [
      { category: 'A & B', name: 'MYOB' },
      { category: 'A & B', name: 'QuickBooks' },
      { category: 'A & B', name: 'Peachtree' },
      { category: 'A & B', name: 'Oracle' },
      { category: 'A & B', name: 'General Accounting' },
      { category: 'A & B', name: 'SAP' },
      { category: 'A & B', name: 'Bookkeping' },
      { category: 'A & B', name: 'Xero' },
      { category: 'Adm', name: 'Collections Proffesionals' },
      { category: 'Adm', name: 'Data Entry' },
      { category: 'Adm', name: 'Technical Support' },
      { category: 'Adm', name: 'Customer Support' },
      { category: 'Adm', name: 'Recruitment' },
      { category: 'Adm', name: 'Transcription' },
      { category: 'Adm', name: 'Back-Office Admin' },
      { category: 'Adm', name: 'Human Resources' },
      { category: 'Adm', name: 'Legal' },
      { category: 'B A', name: 'Business Analysis' },
      { category: 'B A', name: 'Business Plans' },
      { category: 'B A', name: 'Project Management' },
      { category: 'C S', name: 'Outboubd Surveyors' },
      { category: 'C S', name: 'Chat Support' },
      { category: 'C S', name: 'IT HelpDesk' },
      { category: 'C S', name: 'Technical Support' },
      { category: 'C S', name: 'Phone Support' },
      { category: 'C S', name: 'Email Support' },
      { category: 'D & M', name: 'Print Graphic Designers' },
      { category: 'D & M', name: 'Graphic Design' },
      { category: 'D & M', name: 'Web Design' },
      { category: 'D & M', name: '3D Modelling & CAD' },
      { category: 'D & M', name: 'Video Editing' },
      { category: 'D & M', name: 'Illustration' },
      { category: 'Eng', name: 'Electrical Engineering' },
      { category: 'Eng', name: 'Mechanical Engineering' },
      { category: 'Eng', name: 'Civil Engineering' },
      { category: 'Eng', name: 'Quantity Surveying' },
      { category: 'M D', name: 'iOS Development' },
      { category: 'M D', name: 'Android Development' },
      { category: 'M D', name: 'Windows-Based Platform Development' },
      { category: 'M D', name: 'Cross Platform Development' },
      { category: 'M C S', name: 'French Language Experts' },
      { category: 'M C S', name: 'German Language Experts' },
      { category: 'M C S', name: 'Italian Language Experts' },
      { category: 'M C S', name: 'Portuguese Language Experts' },
      { category: 'M C S', name: 'Spanish Language Experts' },
      { category: 'M C S', name: 'Russian Language Experts' },
      { category: 'M C S', name: 'Cantonese Language Experts' },
      { category: 'M C S', name: 'Hokkien Language Experts' },
      { category: 'M C S', name: 'Mandarin Language Experts' },
      { category: 'M C S', name: 'Nipponggo Language Experts' },
      { category: 'Net', name: 'Microsoft Certified' },
      { category: 'Net', name: 'Network Administration' },
      { category: 'Net', name: 'Cisco Certified ' },
      { category: 'Net', name: 'Database Administration' },
      { category: 'Net', name: 'Network Operations Centre Engineers ' },
      { category: 'Net', name: 'Server Administration' },
      { category: 'Net', name: 'Google Specialists' },
      { category: 'Net', name: 'System Administration' },
      { category: 'Net', name: 'Systems Analysis' },
      { category: 'O T', name: 'English Teachers' },
      { category: 'S & M', name: 'Search Engine Optimization Specialists' },
      { category: 'S & M', name: 'Search Engine Management Specialists' },
      { category: 'S & M', name: 'Inbound Sales' },
      { category: 'S & M', name: 'Outbound Sales ' },
      { category: 'S & M', name: 'Link Building' },
      { category: 'S & M', name: 'Lead Generation' },
      { category: 'S & M', name: 'Social Media Marketing' },
      { category: 'S & M', name: 'Telemarketing' },
      { category: 'S & M', name: 'Internet Marketing' },
      { category: 'S & M', name: 'Lead Mining' },
      { category: 'S & M', name: 'Appointment Setting' },
      { category: 'S & M', name: 'Purchasing Assistants' },
      { category: 'S D', name: '.NET Framework Developers and Programmers' },
      { category: 'S D', name: 'Game Development' },
      { category: 'S D', name: 'Software QA & Testing' },
      { category: 'S D', name: 'C++ Development' },
      { category: 'S D', name: 'C# Development' },
      { category: 'S D', name: 'Java Development' },
      { category: 'S D', name: 'Software Application Development' },
      { category: 'V A', name: 'Marketing Assistance' },
      { category: 'V A', name: 'Personal Assistance' },
      { category: 'V A', name: 'Technical Assistance' },
      { category: 'V A', name: 'Legal Assistance' },
      { category: 'V A', name: 'Financial Assistance' },
      { category: 'V A', name: 'Executive Assistance' },
      { category: 'W D', name: 'PHP Development' },
      { category: 'W D', name: 'Flash Development' },
      { category: 'W D', name: 'Front-End Development' },
      { category: 'W D', name: 'Web QA & Testing' },
      { category: 'W D', name: 'Java Development' },
      { category: 'W D', name: 'Ruby-On-Rails Development' },
      { category: 'W D', name: 'Magento Development' },
      { category: 'W D', name: 'ASP Development' },
      { category: 'W D', name: 'Python Development' },
      { category: 'W D', name: 'Node.JS Development' },
      { category: 'W D', name: 'WordPress Development' },
      { category: 'W D', name: 'Joomla Development' },
      { category: 'W D', name: 'User Interface Designs' },
      { category: 'W D', name: 'Drupal Development' },
      { category: 'Wri', name: 'Web Content and Articles' },
      { category: 'Wri', name: 'Technical and Manual Writing' },
      { category: 'Wri', name: 'Blogging' },
      { category: 'Wri', name: 'Sales and Business Marketing Writers' },
      { category: 'Wri', name: 'SEO Writing' }];

    $scope.jobClass = [
    { name: 'I.T.'},
    { name: 'Non I.T.'}
    ];

    $scope.OModel = [
    { name : 'Home Office' },
    { name : 'Office Location' },
    { name : 'Project Based' }
    ];

    $scope.jobComp = [
    { name: 'RemoteStaff Inc.' },
    { name: 'RemoteStaff client' },
    { name: 'Realestate.ph' }
    ];

    $scope.jobStatus = [
    { name: 'New' },
    { name: 'Archive' },
    { name: 'Active' }
    ];

    $scope.jobShowStatus = [
    { name: 'Yes' },
    { name: 'No' }];


   $scope.reqType = [
    {name:'Beginner'},
    {name:'Intermediate'},
    {name:'Advanced'}
    ];

    $scope.resType = [
    {name:'Beginner'},
    {name:'Intermediate'},
    {name:'Advanced'}
    ];

    // Job Order Select Tags
    $scope.job_order_level = [
      {name:'Ful-Time 9 hrs w/1hr break'},
      {name:'Part Time 4hrs'}
    ];

    $scope.work_status = [
      {name:'Entry (1-3 years)'},
      {name:'Mid Level (3-5 years)'},
      {name:'Expert (More than 5 years)'}
    ];

    // Working Status Values 227 Lines
    $scope.working_time_zone = [
      {name: 'Africa/Johannesburg'},
      {name: 'America/Adak'},
      {name: 'America/Anchorage'},
      {name: 'America/Anguilla'},
      {name: 'America/Antigua'},
      {name: 'America/Araguaina'},
      {name: 'America/Argentina/Buenos_Aires'},
      {name: 'America/Argentina/Catamarca'},
      {name: 'America/Argentina/Cordoba'},
      {name: 'America/Argentina/Jujuy'},
      {name: 'America/Argentina/La_Rioja'},
      {name: 'America/Argentina/Mendoza'},
      {name: 'America/Argentina/Rio_Gallegos'},
      {name: 'America/Argentina/Salta'},
      {name: 'America/Argentina/San_Juan'},
      {name: 'America/Argentina/San_Luis'},
      {name: 'America/Argentina/Tucuman'},
      {name: 'America/Argentina/Ushuaia'},
      {name: 'America/Aruba'},
      {name: 'America/Asuncion'},
      {name: 'America/Atikokan'},
      {name: 'America/Bahia'},
      {name: 'America/Bahia_Banderas'},
      {name: 'America/Barbados'},
      {name: 'America/Belem'},
      {name: 'America/Belize'},
      {name: 'America/Blanc-Sablon'},
      {name: 'America/Boa_Vista'},
      {name: 'America/Bogota'},
      {name: 'America/Boise'},
      {name: 'America/Cambridge_Bay'},
      {name: 'America/Campo_Grande'},
      {name: 'America/Cancun'},
      {name: 'America/Caracas'},
      {name: 'America/Cayenne'},
      {name: 'America/Cayman'},
      {name: 'America/Chicago'},
      {name: 'America/Chihuahua'},
      {name: 'America/Costa_Rica'},
      {name: 'America/Creston'},
      {name: 'America/Cuiaba'},
      {name: 'America/Curacao'},
      {name: 'America/Danmarkshavn'},
      {name: 'America/Dawson'},
      {name: 'America/Dawson_Creek'},
      {name: 'America/Denver'},
      {name: 'America/Detroit'},
      {name: 'America/Dominica'},
      {name: 'America/Edmonton'},
      {name: 'America/Eirunepe'},
      {name: 'America/El_Salvador'},
      {name: 'America/Fortaleza'},
      {name: 'America/Glace_Bay'},
      {name: 'America/Godthab'},
      {name: 'America/Goose_Bay'},
      {name: 'America/Grand_Turk'},
      {name: 'America/Grenada'},
      {name: 'America/Guadeloupe'},
      {name: 'America/Guatemala'},
      {name: 'America/Guayaquil'},
      {name: 'America/Guyana'},
      {name: 'America/Halifax'},
      {name: 'America/Havana'},
      {name: 'America/Hermosillo'},
      {name: 'America/Indiana/Indianapolis'},
      {name: 'America/Indiana/Knox'},
      {name: 'America/Indiana/Marengo'},
      {name: 'America/Indiana/Petersburg'},
      {name: 'America/Indiana/Tell_City'},
      {name: 'America/Indiana/Vevay'},
      {name: 'America/Indiana/Vincennes'},
      {name: 'America/Indiana/Winamac'},
      {name: 'America/Inuvik'},
      {name: 'America/Iqaluit'},
      {name: 'America/Jamaica'},
      {name: 'America/Juneau'},
      {name: 'America/Kentucky/Louisville'},
      {name: 'America/Kentucky/Monticello'},
      {name: 'America/Kralendijk'},
      {name: 'America/La_Paz'},
      {name: 'America/Lima'},
      {name: 'America/Los_Angeles'},
      {name: 'America/Louisville'},
      {name: 'America/Lower_Princes'},
      {name: 'America/Maceio'},
      {name: 'America/Managua'},
      {name: 'America/Manaus'},
      {name: 'America/Marigot'},
      {name: 'America/Martinique'},
      {name: 'America/Matamoros'},
      {name: 'America/Mazatlan'},
      {name: 'America/Menominee'},
      {name: 'America/Merida'},
      {name: 'America/Metlakatla'},
      {name: 'America/Mexico_City'},
      {name: 'America/Miquelon'},
      {name: 'America/Moncton'},
      {name: 'America/Monterrey'},
      {name: 'America/Montevideo'},
      {name: 'America/Montreal'},
      {name: 'America/Montserrat'},
      {name: 'America/Nassau'},
      {name: 'America/New_York'},
      {name: 'America/Nipigon'},
      {name: 'America/Nome'},
      {name: 'America/Noronha'},
      {name: 'America/North_Dakota/Beulah'},
      {name: 'America/North_Dakota/Center'},
      {name: 'America/North_Dakota/New_Salem'},
      {name: 'America/Ojinaga'},
      {name: 'America/Panama'},
      {name: 'America/Pangnirtung'},
      {name: 'America/Paramaribo'},
      {name: 'America/Phoenix'},
      {name: 'America/Port_of_Spain'},
      {name: 'America/Port-au-Prince'},
      {name: 'America/Porto_Velho'},
      {name: 'America/Puerto_Rico'},
      {name: 'America/Rainy_River'},
      {name: 'America/Rankin_Inlet'},
      {name: 'America/Recife'},
      {name: 'America/Regina'},
      {name: 'America/Resolute'},
      {name: 'America/Rio_Branco'},
      {name: 'America/Santa_Isabel'},
      {name: 'America/Santarem'},
      {name: 'America/Santiago'},
      {name: 'America/Santo_Domingo'},
      {name: 'America/Sao_Paulo'},
      {name: 'America/Scoresbysund'},
      {name: 'America/Shiprock'},
      {name: 'America/Sitka'},
      {name: 'America/St_Barthelemy'},
      {name: 'America/St_Johns'},
      {name: 'America/St_Kitts'},
      {name: 'America/St_Lucia'},
      {name: 'America/St_Thomas'},
      {name: 'America/St_Vincent'},
      {name: 'America/Swift_Current'},
      {name: 'America/Tegucigalpa'},
      {name: 'America/Thule'},
      {name: 'America/Thunder_Bay'},
      {name: 'America/Tijuana'},
      {name: 'America/Toronto'},
      {name: 'America/Tortola'},
      {name: 'America/Vancouver'},
      {name: 'America/Whitehorse'},
      {name: 'America/Winnipeg'},
      {name: 'America/Yakutat'},
      {name: 'America/Yellowknife'},
      {name: 'Asia/Bangkok'},
      {name: 'Asia/Kolkata'},
      {name: 'Asia/Manila'},
      {name: 'Asia/Singapore'},
      {name: 'Australia/Adelaide'},
      {name: 'Australia/Brisbane'},
      {name: 'Australia/Broken_Hill'},
      {name: 'Australia/Currie'},
      {name: 'Australia/Darwin'},
      {name: 'Australia/Eucla'},
      {name: 'Australia/Hobart'},
      {name: 'Australia/Lindeman'},
      {name: 'Australia/Lord_Howe'},
      {name: 'Australia/Melbourne'},
      {name: 'Australia/Perth'},
      {name: 'Australia/Queensland'},
      {name: 'Australia/Sydney'},
      {name: 'Europe/Amsterdam'},
      {name: 'Europe/Andorra'},
      {name: 'Europe/Athens'},
      {name: 'Europe/Belgrade'},
      {name: 'Europe/Berlin'},
      {name: 'Europe/Bratislava'},
      {name: 'Europe/Brussels'},
      {name: 'Europe/Bucharest'},
      {name: 'Europe/Budapest'},
      {name: 'Europe/Busingen'},
      {name: 'Europe/Chisinau'},
      {name: 'Europe/Copenhagen'},
      {name: 'Europe/Dublin'},
      {name: 'Europe/Gibraltar'},
      {name: 'Europe/Guernsey'},
      {name: 'Europe/Helsinki'},
      {name: 'Europe/Isle_of_Man'},
      {name: 'Europe/Istanbul'},
      {name: 'Europe/Jersey'},
      {name: 'Europe/Kaliningrad'},
      {name: 'Europe/Kiev'},
      {name: 'Europe/Lisbon'},
      {name: 'Europe/Ljubljana'},
      {name: 'Europe/London'},
      {name: 'Europe/Luxembourg'},
      {name: 'Europe/Madrid'},
      {name: 'Europe/Malta'},
      {name: 'Europe/Mariehamn'},
      {name: 'Europe/Minsk'},
      {name: 'Europe/Monaco'},
      {name: 'Europe/Moscow'},
      {name: 'Europe/Nicosia'},
      {name: 'Europe/Oslo'},
      {name: 'Europe/Paris'},
      {name: 'Europe/Podgorica'},
      {name: 'Europe/Prague'},
      {name: 'Europe/Riga'},
      {name: 'Europe/Rome'},
      {name: 'Europe/Samara'},
      {name: 'Europe/San_Marino'},
      {name: 'Europe/Sarajevo'},
      {name: 'Europe/Simferopol'},
      {name: 'Europe/Skopje'},
      {name: 'Europe/Sofia'},
      {name: 'Europe/Stockholm'},
      {name: 'Europe/Tallinn'},
      {name: 'Europe/Tirane'},
      {name: 'Europe/Uzhgorod'},
      {name: 'Europe/Vaduz'},
      {name: 'Europe/Vatican'},
      {name: 'Europe/Vienna'},
      {name: 'Europe/Vilnius'},
      {name: 'Europe/Volgograd'},
      {name: 'Europe/Warsaw'},
      {name: 'Europe/Zagreb'},
      {name: 'Europe/Zaporozhye'},
      {name: 'Europe/Zurich'},
      {name: 'Pacific/Auckland'},
      {name: 'Pacific/Chatham'},
      {name: 'Pacific/Honolulu'}
    ];

    // End Working Time Values 48 lines
    $scope.working_end_time = [
      {name:'12:00 AM'},
      {name:'12:30 AM'},
      {name:'01:00 AM'},
      {name:'01:30 AM'},
      {name:'02:00 AM'},
      {name:'02:30 AM'},
      {name:'03:00 AM'},
      {name:'03:30 AM'},
      {name:'04:00 AM'},
      {name:'04:30 AM'},
      {name:'05:00 AM'},
      {name:'05:30 AM'},
      {name:'06:00 AM'},
      {name:'06:30 AM'},
      {name:'07:00 AM'},
      {name:'07:30 AM'},
      {name:'08:00 AM'},
      {name:'08:30 AM'},
      {name:'09:00 AM'},
      {name:'09:30 AM'},
      {name:'10:00 AM'},
      {name:'10:30 AM'},
      {name:'11:00 AM'},
      {name:'11:30 AM'},
      {name:'12:00 PM'},
      {name:'12:30 PM'},
      {name:'01:00 PM'},
      {name:'01:30 PM'},
      {name:'02:00 PM'},
      {name:'02:30 PM'},
      {name:'03:00 PM'},
      {name:'03:30 PM'},
      {name:'04:00 PM'},
      {name:'04:30 PM'},
      {name:'05:00 PM'},
      {name:'05:30 PM'},
      {name:'06:00 PM'},
      {name:'06:30 PM'},
      {name:'07:00 PM'},
      {name:'07:30 PM'},
      {name:'08:00 PM'},
      {name:'08:30 PM'},
      {name:'09:00 PM'},
      {name:'09:30 PM'},
      {name:'10:00 PM'},
      {name:'10:30 PM'},
      {name:'11:00 PM'},
      {name:'11:30 PM'}
    ];

    // --- Adding & Removing Columns ---
    // Requirements
    $scope.reqColumns = [{ name:'' }];
    $scope.addNewReqColumn = function() {
      var newItemNo = $scope.reqColumns.length+1;
      $scope.reqColumns.push(newItemNo);
    };
    $scope.removeReqColumn = function(index) {
        // remove the row specified in index
        $scope.reqColumns.splice( index, 1);
      };
     $scope.reqCol = {}

    //  ------ Requirements Good to Have -------
    $scope.reqMHColumns = [{name:''}];
    $scope.addNewReqMHColumn = function() {
      var newItemNo = $scope.reqMHColumns.length+1;
      $scope.reqMHColumns.push({});
    };
    $scope.removeReqMHColumn = function(index) {
      // remove the row specified in index
      $scope.reqMHColumns.splice( index, 1);
    };
    $scope.reqMHCol = {}

    //  ------ Requirements Good to Have -------
    $scope.reqGTHColumns = [{name:''}];
    $scope.addNewReqGTHColumn = function() {
      var newItemNo = $scope.reqGTHColumns.length+1;
      $scope.reqGTHColumns.push({});
    };
    $scope.removeReqGTHColumn = function(index) {
      // remove the row specified in index
      $scope.reqGTHColumns.splice( index, 1);
    };
    $scope.reqGTHCol = {}

     //  ------ Requirements Tasks -------
    $scope.reqTaskColumns = [{name:''}];
    $scope.addNewReqTaskColumn = function() {
      var newItemNo = $scope.reqTaskColumns.length+1;
      $scope.reqTaskColumns.push({});
    };
    $scope.removeReqTaskColumn = function(index) {
      // remove the row specified in index
      $scope.reqTaskColumns.splice( index, 1);
    };
    $scope.reqTaskCol = {}

    //  ------ Requirement Skills -------
    $scope.reqSkillColumns = [{name:''}];
    $scope.addNewReqSkillColumn = function() {
      var newItemNo = $scope.reqSkillColumns.length+1;
      $scope.reqSkillColumns.push({});
    };
    $scope.removeReqSkillColumn = function(index) {
      // remove the row specified in index
      $scope.reqSkillColumns.splice( index, 1);
    };
    $scope.reqSkillCol = {}

    //  ------ Duties & Responsibilities -------
    $scope.dutRespColumns = [{name:''}];
    $scope.addNewDutRespColumn = function() {
      var newItemNo = $scope.dutRespColumns.length+1;
      $scope.dutRespColumns.push({});
    };
    $scope.removeDutRespColumn = function(index) {
      // remove the row specified in index
      $scope.dutRespColumns.splice( index, 1);
    };
    $scope.dutRespCol = {}

    //  ------ Responsibilities -------
    $scope.respColumns = [{name:''}];
    $scope.addNewRespColumn = function() {
      var newItemNo = $scope.respColumns.length+1;
      $scope.respColumns.push({});
    };
    $scope.removeRespColumn = function(index) {
      // remove the row specified in index
      $scope.respColumns.splice( index, 1);
    };
    $scope.respCol = {}

    // --------------- Radion Buttons -----------
    $scope.training  = $scope.displayDoc.will_you_provide_training;
    $scope.calls = $scope.displayDoc.will_the_staff_make_calls;
    $scope.first_time_hiring  = $scope.displayDoc.is_this_your_first_staff_hire_for_the_job_role;
    $scope.report = $scope.displayDoc.will_the_staff_report_directly_to_you;
    $scope.updData = {}
    $scope.updData.manager_info={};
    $scope.updData.questions_to_be_asked={};

    // Get all Data Function for Update
    $scope.updateDocForm = function(){

      // console.log($scope.training);
      // console.log($scope.calls);
      // console.log($scope.first_time_hiring);
      // console.log($scope.report);

      //  ------ Requirements -------
      // Add Column Requirements
      $scope.reqCol = $scope.reqColumns;
      // Remove $$hashkey
      var req = JSON.stringify( $scope.reqCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.updData.requirements = req;

      //  ------ Requirements Must Have -------
      // Add Column Requirements
      $scope.reqMHCol = $scope.reqMHColumns;
      // Remove $$hashkey
      var reqMH = JSON.stringify( $scope.reqMHCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.updData.requirements_must_have = reqMH;

      //  ------ Requirements Good to Have -------
      // Add Column Requirements
      $scope.reqGTHCol = $scope.reqGTHColumns;
      // Remove $$hashkey
      var reqGTH = JSON.stringify( $scope.reqGTHCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.updData.requirements_good_to_have = reqGTH;

      //  ------ Requirements Tasks -------
      // Add Column Requirements
      $scope.reqTaskCol = $scope.reqTaskColumns;
      // Remove $$hashkey
      var reqTask = JSON.stringify( $scope.reqTaskCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.updData.requirements_task = reqTask;

      //  ------ Requirement Skills -------
      // Add Column Requirements
      $scope.reqSkillCol = $scope.reqSkillColumns;
      // Remove $$hashkey
      var reqSkill = JSON.stringify( $scope.reqSkillCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.updData.requirements_skills = reqSkill;

      //  ------ Duties & Responsibilities -------
      // Add Column Requirements
      $scope.dutRespCol = $scope.dutRespColumns;
      // Remove $$hashkey
      var dutRespon = JSON.stringify( $scope.dutRespCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.updData.duties_and_responsibilities = dutRespon;

      //  ------ Responsibilities -------
      // Add Column Requirements
      $scope.respCol = $scope.respColumns;
      // Remove $$hashkey
      var respon = JSON.stringify( $scope.respCol, function( key, value ) {
          if( key === "$$hashKey" ) {
              return undefined;}
          return value;
        });
      $scope.updData.responsibi = respon;
      $scope.updData.upd_job_title = $scope.upd_job_title;
      $scope.updData.category = $scope.cat;
      $scope.updData.classification = $scope.class
      $scope.updData.outsource_model = $scope.outSModel;
      $scope.updData.company = $scope.comp;
      // $scope.updData.heading = $scope.heading;
      $scope.updData.job_stat = $scope.jStat;
      $scope.updData.job_show_stat = $scope.jShowStat;
      // $scope.updData.quantity = $scope.quantity;
      $scope.updData.job_order_level = $scope.JO_level;
      $scope.updData.job_order_work_stat = $scope.JO_work_stat;
      $scope.updData.job_order_working_timezone = $scope.timezone;
      $scope.updData.job_order_working_start_time = $scope.work_start;
      $scope.updData.job_order_working_end_time = $scope.work_end;
      $scope.updData.questions_to_be_asked.first = $scope.question1;
      $scope.updData.questions_to_be_asked.second = $scope.question2;
      $scope.updData.questions_to_be_asked.third = $scope.question3;
      $scope.updData.will_you_provide_training = $scope.training;
      $scope.updData.will_the_staff_make_calls = $scope.calls;
      $scope.updData.is_this_your_first_staff_hire_for_the_job_role = $scope.first_time_hiring;
      $scope.updData.will_the_staff_report_directly_to_you = $scope.report;
      $scope.updData.manager_info.name = $scope.mngr_name;
      $scope.updData.manager_info.email = $scope.mngr_email;
      $scope.updData.manager_info.contact = $scope.mngr_contact;
      // console.log("updatedDocForm Works !!!");
      console.log($scope.updData);
      };
    });

    
    // Requirements Card Fields
    // app.controller('reqAd', function($scope, SelectedData){

      // $scope.displayDoc = SelectedData;

      // $scope.reqType = [
      // {name:'Beginner'},
      // {name:'Intermediate'},
      // {name:'Advanced'}
      // ];

      // $scope.reqColumns = [{
      //   colId: 'col1', 
      //   name:'',
      //   dataType:[]
      // }];

      // $scope.addNewReqColumn = function() {
      //   var newItemNo = $scope.reqColumns.length+1;
      //   $scope.reqColumns.push(newItemNo);
      // };

      // // Remove Column
      // $scope.removeReqColumn = function(index) {
      //     // remove the row specified in index
      //     $scope.reqColumns.splice( index, 1);
      //     // if no rows left in the array create a blank array
      //     if ( $scope.reqColumns.length() === 0 || $scope.reqColumns.length() == null){
      //       alert('no rec');
      //       $scope.reColumns.push = [{"colId":"col1"}];
      //     }
      //   };
      // });


    // // Responsibilities Card Fields
    // app.controller('resAd', function($scope, SelectedData) {

    //   // Populate Fields from Choosen Document
    //   $scope.displayDoc = SelectedData;

    //   // Values for Select Fields
    //   $scope.resType = [
    //   {name:'Beginner'},
    //   {name:'Intermediate'},
    //   {name:'Advanced'}
    //   ];

    //   $scope.respColumns = [{
    //     colId: 'col1', 
    //     name:'',
    //     dataType:[]
    //   }];

    //   $scope.addNewRespColumn = function() {
    //     var newItemNo = $scope.respColumns.length+1;
    //     $scope.respColumns.push(newItemNo);
    //   };

    //   // Remove Column
    //   $scope.removeRespColumn = function(index) {
    //       // remove the row specified in index
    //       $scope.respColumns.splice( index, 1);
    //       // if no rows left in the array create a blank array
    //       if ( $scope.respColumns.length() === 0 || $scope.respColumns.length() == null){
    //         alert('no rec');
    //         $scope.respColumns.push = [{"colId":"col1"}];
    //       }
    //     };
    //   });
    


/*
  // ----------------- Create JobAds ------------------------
   // Populate Fields from Choosen Document
   app.controller('populateCrtJobAds', function($scope){

  // Values for Select Fields
  $scope.jobcat = 
    [
      { category: 'A & B', name: 'MYOB' },
      { category: 'A & B', name: 'QuickBooks' },
      { category: 'A & B', name: 'Peachtree' },
      { category: 'A & B', name: 'Oracle' },
      { category: 'A & B', name: 'General Accounting' },
      { category: 'A & B', name: 'SAP' },
      { category: 'A & B', name: 'Bookkeping' },
      { category: 'A & B', name: 'Xero' },
      { category: 'Adm', name: 'Collections Proffesionals' },
      { category: 'Adm', name: 'Data Entry' },
      { category: 'Adm', name: 'Technical Support' },
      { category: 'Adm', name: 'Customer Support' },
      { category: 'Adm', name: 'Recruitment' },
      { category: 'Adm', name: 'Transcription' },
      { category: 'Adm', name: 'Back-Office Admin' },
      { category: 'Adm', name: 'Human Resources' },
      { category: 'Adm', name: 'Legal' },
      { category: 'B A', name: 'Business Analysis' },
      { category: 'B A', name: 'Business Plans' },
      { category: 'B A', name: 'Project Management' },
      { category: 'C S', name: 'Outboubd Surveyors' },
      { category: 'C S', name: 'Chat Support' },
      { category: 'C S', name: 'IT HelpDesk' },
      { category: 'C S', name: 'Technical Support' },
      { category: 'C S', name: 'Phone Support' },
      { category: 'C S', name: 'Email Support' },
      { category: 'D & M', name: 'Print Graphic Designers' },
      { category: 'D & M', name: 'Graphic Design' },
      { category: 'D & M', name: 'Web Design' },
      { category: 'D & M', name: '3D Modelling & CAD' },
      { category: 'D & M', name: 'Video Editing' },
      { category: 'D & M', name: 'Illustration' },
      { category: 'Eng', name: 'Electrical Engineering' },
      { category: 'Eng', name: 'Mechanical Engineering' },
      { category: 'Eng', name: 'Civil Engineering' },
      { category: 'Eng', name: 'Quantity Surveying' },
      { category: 'M D', name: 'iOS Development' },
      { category: 'M D', name: 'Android Development' },
      { category: 'M D', name: 'Windows-Based Platform Development' },
      { category: 'M D', name: 'Cross Platform Development' },
      { category: 'M C S', name: 'French Language Experts' },
      { category: 'M C S', name: 'German Language Experts' },
      { category: 'M C S', name: 'Italian Language Experts' },
      { category: 'M C S', name: 'Portuguese Language Experts' },
      { category: 'M C S', name: 'Spanish Language Experts' },
      { category: 'M C S', name: 'Russian Language Experts' },
      { category: 'M C S', name: 'Cantonese Language Experts' },
      { category: 'M C S', name: 'Hokkien Language Experts' },
      { category: 'M C S', name: 'Mandarin Language Experts' },
      { category: 'M C S', name: 'Nipponggo Language Experts' },
      { category: 'Net', name: 'Microsoft Certified' },
      { category: 'Net', name: 'Network Administration' },
      { category: 'Net', name: 'Cisco Certified ' },
      { category: 'Net', name: 'Database Administration' },
      { category: 'Net', name: 'Network Operations Centre Engineers ' },
      { category: 'Net', name: 'Server Administration' },
      { category: 'Net', name: 'Google Specialists' },
      { category: 'Net', name: 'System Administration' },
      { category: 'Net', name: 'Systems Analysis' },
      { category: 'O T', name: 'English Teachers' },
      { category: 'S & M', name: 'Search Engine Optimization Specialists' },
      { category: 'S & M', name: 'Search Engine Management Specialists' },
      { category: 'S & M', name: 'Inbound Sales' },
      { category: 'S & M', name: 'Outbound Sales ' },
      { category: 'S & M', name: 'Link Building' },
      { category: 'S & M', name: 'Lead Generation' },
      { category: 'S & M', name: 'Social Media Marketing' },
      { category: 'S & M', name: 'Telemarketing' },
      { category: 'S & M', name: 'Internet Marketing' },
      { category: 'S & M', name: 'Lead Mining' },
      { category: 'S & M', name: 'Appointment Setting' },
      { category: 'S & M', name: 'Purchasing Assistants' },
      { category: 'S D', name: '.NET Framework Developers and Programmers' },
      { category: 'S D', name: 'Game Development' },
      { category: 'S D', name: 'Software QA & Testing' },
      { category: 'S D', name: 'C++ Development' },
      { category: 'S D', name: 'C# Development' },
      { category: 'S D', name: 'Java Development' },
      { category: 'S D', name: 'Software Application Development' },
      { category: 'V A', name: 'Marketing Assistance' },
      { category: 'V A', name: 'Personal Assistance' },
      { category: 'V A', name: 'Technical Assistance' },
      { category: 'V A', name: 'Legal Assistance' },
      { category: 'V A', name: 'Financial Assistance' },
      { category: 'V A', name: 'Executive Assistance' },
      { category: 'W D', name: 'PHP Development' },
      { category: 'W D', name: 'Flash Development' },
      { category: 'W D', name: 'Front-End Development' },
      { category: 'W D', name: 'Web QA & Testing' },
      { category: 'W D', name: 'Java Development' },
      { category: 'W D', name: 'Ruby-On-Rails Development' },
      { category: 'W D', name: 'Magento Development' },
      { category: 'W D', name: 'ASP Development' },
      { category: 'W D', name: 'Python Development' },
      { category: 'W D', name: 'Node.JS Development' },
      { category: 'W D', name: 'WordPress Development' },
      { category: 'W D', name: 'Joomla Development' },
      { category: 'W D', name: 'User Interface Designs' },
      { category: 'W D', name: 'Drupal Development' },
      { category: 'Wri', name: 'Web Content and Articles' },
      { category: 'Wri', name: 'Technical and Manual Writing' },
      { category: 'Wri', name: 'Blogging' },
      { category: 'Wri', name: 'Sales and Business Marketing Writers' },
      { category: 'Wri', name: 'SEO Writing' }
    ];

  $scope.jobClass = [
  { name: 'I.T.'},
  { name: 'Non I.T.'}
  ];

  $scope.OM = [
  { name : 'Home Office' },
  { name : 'Office Location' },
  { name : 'Project Based' }
  ];

  $scope.jobComp = [
  { name: 'RemoteStaff Inc.' },
  { name: 'RemoteStaff client' },
  { name: 'Realestate.ph' }
  ];

  $scope.jobStatus = [
  { name: 'New' },
  { name: 'Archive' },
  { name: 'Active' }
  ];

  $scope.jobShowStatus = [
  { name: 'Yes' },
  { name: 'No' }];
});*/










/*
  // Dialog
  app.controller('AppCtrl', function($scope, $mdDialog) {

    $scope.showAdvanced = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: './templates/dialogContent.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
  });
    };

  // Important for Dialog
  function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }
});*/

    // History Card Feildset for Add Column
    // app.controller('MainCtrl', function($scope) {
    // //  $scope.dataType = ['type1', 'type2', 'type'];
    // $scope.dataType = [
    // {id: 1, colId:['col1', 'col4'], dataTypeName: 'Date'},
    // {id: 2, colId:['col2', 'col3'], dataTypeName: 'Alpha'},
    // {id: 3, colId:['col5', 'col6', 'col7', 'col8'], dataTypeName: 'List Value'}];

    // $scope.columns = [{colId: 'col1', name:'', dataType:[], dataFormat:'',  excludedChar:'', maxLength:'', isKeyField:false, isKeyRequired:false }];

    // $scope.addNewColumn = function() {
    //   var newItemNo = $scope.columns.length+1;
    //   $scope.columns.push({'colId':'col'+newItemNo});
    // };

    // $scope.removeColumn = function(index) {
    //     // remove the row specified in index
    //     $scope.columns.splice( index, 1);
    //     // if no rows left in the array create a blank array
    //     if ( $scope.columns.length() === 0 || $scope.columns.length() == null){
    //       alert('no rec');
    //       $scope.columns.push = [{"colId":"col1"}];
    //     }
    //   };
    // });


// // Sample Datashare
//   app.controller('MainCtrl1', 

//     ['$scope','dataShare', function ($scope,dataShare) {         
//            $scope.text = 'Hey';
//            $scope.send = function(){
//              dataShare.sendData($scope.text);
//            };
//          }
//       ]


//       );

//   app.controller('MainCtrl2', ['$scope','dataShare', function ($scope,dataShare) {             
//                   $scope.text = '';
//                   $scope.$on('data_shared',function(){
//                               var text =  dataShare.getData();    
//                 $scope.text = text;
//           });
//       }
//   ]);

//   app.factory('dataShare',function($rootScope){
//     var service = {};
//     service.data = false;
//     service.sendData = function(data){
//         this.data = data;
//         $rootScope.$broadcast('data_shared');
//     };
//     service.getData = function(){
//       return this.data;
//     };
//     return service;
//   });


//   app.controller('Ctrl', function($scope) {
//     $scope.tasks = [{id:1,'name':'test1'}, {id:2,'name':'test2'}, {id:3,'name':'test3'}];

//     $scope.removeTask = function(taskId){
//       alert("Task Id is "+taskId);
//       console.log(taskId);
//     };
// });

    // <!-- Responsibilities Card -->
    //     <md-card id="resAd" ng-controller="dialogCtrl">
    //         <md-card-title>
    //             <md-card-title-text layout-align=" center">
    //                 <span class="md-headline">Responsibilities</span>
    //             </md-card-title-text>
    //             <md-button class="md-raised" ng-click="showPrompt($event)"><i class="far fa-plus-square" ></i>Add Responsibility</md-button>
    //         </md-card-title>
    //         <md-card-content>
    //             <div layout="column">
    //                 <div ng-if="status" id="status">
    //                     <b layout="row" layout-align="center center" class="md-padding">
    //                         {{status}}
    //                     </b>
    //                 </div>
    //             </div>
    //         </md-card-content>
    //     </md-card>

    // tinymce.init({selector:'textarea',
    //     plugins: "code image"
    // });


    // Responsibilities Card Fieldset
    // Add Column 
    // app.controller('resAd', function($scope){
    // });

    // Requirements Card Fieldset
    // Add Column 

    // Responsibilities Exercise
    // app.controller('resAd', function($scope) {
    //   $scope.clearValue = function() {
    //     $scope.quest = undefined;
    //     $scope.favoriteColor = undefined;
    //     $scope.myForm.$setPristine();
    //   };
    //   $scope.save = function() {
    //     if ($scope.myForm.$valid) {
    //       $scope.myForm.$setSubmitted();
    //       alert('Form was valid.');
    //     } else {
    //       alert('Form was invalid!');
    //     }
    //   };
    // });

//----- Final Working Storing & Adding/Removing  Column ------

// app.controller('SampleCtrl', function($scope) {
 // $scope.columns = [{name:""}];

 //  $scope.addNewReqColumn = function() {
 //    var newItemNo = $scope.columns.length+1;
 //    $scope.columns.push({});
 //  };

 //  $scope.removeReqColumn = function(index) {
 //    // remove the row specified in index
 //    $scope.columns.splice( index, 1);
  
 //  };

 //  $scope.dataCol = {}
 //  $scope.getAllData = function() {
 //      $scope.dataCol.requirements = $scope.columns;
      
 //      // Remove $$hashkey
 //     var  json = JSON.stringify( $scope.dataCol, function( key, value ) {
 //          if( key === "$$hashKey" ) {
 //              return undefined;
 //          }
 //          return value;
 //      });
 //      // console.log(json);
 //      console.log(json);
 //  };

// $scope.model.campuses = [{}]; // initialise the array with an empty object
// function addCampus(){ 
//   // push an empty object onto the array
//   $scope.model.campuses.push({});
// }
// });


// app.controller('MainController', function($scope) {

//   $scope.rows = ['Row 1', 'Row 2'];
  
//   $scope.counter = 3;
  
//   $scope.addRow = function() {
    
//     $scope.rows.push('Row ' + $scope.counter);
//     $scope.counter++;
//   }


//   $scope.getRowData = function() {
//     $scope.data
//   }
// });




// // PyJWT Exercise
// app.controller('PyJWT', function($scope, $http) {

//   // $scope.getData = {}
//   $scope.passData = function() {    
//     // $scope.getData.getName = $scope.name;
//     // $scope.getData.getPwd = $scope.pwd;
//     // console.log($scope.getData);

//     var send_data = {
//       "email" : $scope.email,
//       "password" : $scope.pwd
//     }
//     console.log(send_data);

//     $http({
//       url: 'http://black-widow.remotestaff.com/falcon/auth/01/admin',
//       method: 'POST',
//       data: send_data
//     })
//     .then(function(response) {
//       if (response.status == 200) {
//         $scope.token = response.data.jwt;
//         console.log($scope.token);
//       }
//     }).catch(function(error) {
//       $scope.token = 'unauthorized'
//       console.log(error);
//     });
//   }

// });

// $http.get('/falcon/getSelectedDatas/'+$scope.passNewID, JSON.stringify($scope.passNewID));
//    $http.get("/falcon/getSelectedDatas/"+$scope.passNewID).then(function(result){
//      $scope.selectedID = result;
//      // console.log($scope.selectedID);
//    });


/*
// Checkbox Sample
app.controller('checkbox', function($scope) {
  $scope.items = [1,2,3,4,5];
  $scope.selected = [1];
  $scope.toggle = function (item, list) {
    var idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(item);
    }
  };

  $scope.exists = function (item, list) {
    return list.indexOf(item) > -1;
  };

  $scope.isIndeterminate = function() {
    return ($scope.selected.length !== 0 &&
        $scope.selected.length !== $scope.items.length);
  };

  $scope.isChecked = function() {
    return $scope.selected.length === $scope.items.length;
  };

  $scope.toggleAll = function() {
    if ($scope.selected.length === $scope.items.length) {
      $scope.selected = [];
    } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
      $scope.selected = $scope.items.slice(0);
    }
  };

  $scope.getAllCheckbox = function() {

  }
});



app.controller('Ctrl1', function($scope) {
  $scope.roles = [
    'guest', 
    'user', 
    'customer', 
    'admin'
  ];
  $scope.user = {
    roles: ['user']
  };
  $scope.checkAll = function() {
    $scope.user.roles = angular.copy($scope.roles);
  };
  $scope.uncheckAll = function() {
    $scope.user.roles = [];
  };
  $scope.checkFirst = function() {
    $scope.user.roles.splice(0, $scope.user.roles.length); 
    $scope.user.roles.push('guest');
    console.log($scope.user);
    console.log($scope.user.roles);
    console.log($scope.roles);
  };
  console.log("Ctrl1 is working");
    console.log($scope.roles);

});*/



    // LocalStorage Example
    //   var x = JSON.stringify($scope.disDoc.data);
    //   console.log(x);

    //        // Check browser support
    // if (typeof(Storage) !== "undefined") {
    //     // Store
    //     localStorage.setItem("lastname", x);

    //     var retrieveObj = JSON.parse(localStorage.getItem('lastname'));

    //     console.log('documentData', JSON.stringify(retrieveObj));

    //     // Retrieve
    //     // document.getElementById("result").innerHTML = localStorage.getItem("lastname");
    //     console.log(localStorage.getItem("lastname"));

    //     console.log("localStorage is undefined");
    // } else {
    //     // document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    //     console.log("localStorage is undefined");
    // }


/*  // Creating a Global Variable
  app.service('SelectedData', function () {
    return {};
    //    // Check browser support
    // if (typeof(Storage) !== "undefined") {
    //     // Store
    //     localStorage.setItem("lastname", x);


    //     var retrieveObj = JSON.parse(localStorage.getItem('lastname'));

    //     console.log('documentData', JSON.stringify(retrieveObj));

    //     // Retrieve
    //     // document.getElementById("result").innerHTML = localStorage.getItem("lastname");
    //     console.log(localStorage.getItem("lastname"));

    //     console.log("localStorage is undefined");
    // } else {
    //     // document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    //     console.log("localStorage is undefined");
    // }
  });*/