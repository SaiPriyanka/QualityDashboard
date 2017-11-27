var sonarUrl;
var jenkinsUrl;
var cerberusUrl;
var serverUrl;
var codeReviewUrl;
var exports= new Object();

// init method
$(document).ready(function() {

		$(document).ready(function(){ // init help tooltip
			$('[data-toggle="tooltip"]').tooltip();
		});

		
		let conf = exports.initProject();

		let report = new Report(conf);

		report.init();
		
		getAppVersion();
});

function getAppVersion() {
	let url = serverUrl + "/version";

	$.ajax({
		type: 'GET',
		dataType: 'text',
		data: {},
		url: url,
		success: function (msg) {
			$("#versionApplicative").html("Application version : " + msg);
		}
	});
}


class Report {

	constructor(conf) {
			this.conf=conf;
			this.settings=conf.toolsUrlSettings;
			this.dashboardData=conf.dashboardSettings;
			this.codeReviewData=conf.codeReviewSettings;

			sonarUrl		= (this.settings.sonar != undefined) ? "http://" + this.settings.sonar.host + ":" + this.settings.sonar.port : null;
			jenkinsUrl		= (this.settings.jenkins != undefined) ? "http://" + this.settings.jenkins.host + ":" + this.settings.jenkins.port : null;
			cerberusUrl		= (this.settings.cerberus != undefined) ? "http://" + this.settings.cerberus.host + ":" + this.settings.cerberus.port : null;
			serverUrl		= (this.settings.server != undefined) ? "http://" + this.settings.server.host + ":" +  this.settings.server.port : null;
			codeReviewUrl	= (this.settings.cordonBleu != undefined) ? "http://" + this.settings.cordonBleu.host + ":" + this.settings.cordonBleu.port : null;

			// add dashboardData
			let thisObject = this;
			this.dashboardData.forEach(function(data) {
				thisObject.addDashboard(data);
			});
	}

	addDashboard (data) {
			// 1 - ajouter un nouvel onglet
			$('#onglets').append(
					'<li id="menu-' + data.name + '">' +
								'        <a href="?project=' + data.name + '">' +
								'            <i class="pe-7s-graph"></i>' +
								'            <p>' + data.name + '</p>' +
								'        </a>' +
								'    </li> '
			);

			mapProjectConfiguration[data.name] = data;
	}

	init () {

        mondayAndSunday = Utils.getLastMondayAndSunday();
        let thisObject = this;

        this.contextData = Object();
        this.contextData.mondayAndSunday = mondayAndSunday;

		Utils.setInputDate("#beginDate", mondayAndSunday.monday);
		Utils.setInputDate("#endDate", mondayAndSunday.sunday);
		Utils.setInputDate("#beginDateCodeReview", mondayAndSunday.mondayCodeReview);
		Utils.setInputDate("#endDateCodeReview", mondayAndSunday.sundayCodeReview);
		Utils.setInputDate("#beginDateCodeReview2", mondayAndSunday.mondayCodeReview);
		Utils.setInputDate("#endDateCodeReview2", mondayAndSunday.sundayCodeReview);

		
		$("#reportCerberusGeneral").hide();
		let project = Utils.findGetParameter("project");
		$('#projectParameter').val(project);
		$('#projectParameter2').val(project);
		// show menu active
		if(project != null) {
			$('#menu-' + project).addClass("active");
		}
		// specifique code review link
		if(project === "codeReview") {
			$('#chooseYourProject').hide();
			$('#dashboardContainer').hide();
			$('#codeReview').show();
			$("#betweenDateCodeReview").text("Between " + Utils.formatDate(mondayAndSunday.mondayCodeReview) + " and " + Utils.formatDate(mondayAndSunday.sundayCodeReview));
			//$("#codeReviewContent").append($("#templateCodeReview"));
			this.codeReviewData.teams.forEach(function (data) {
				let cordonBleuInfo = new CordonBleuInfo(thisObject.conf, thisObject.contextData, "#codereview-"  + data.name + " [name='?']", data.name);
				cordonBleuInfo.getInfo();
			});
		} else if(mapProjectConfiguration[project] != undefined) {
			// general part
			let data = mapProjectConfiguration[project];
            this.contextData.teamDashboardSettings = data; // TODO

            $("#betweenDate").text("Between " + Utils.formatDate(mondayAndSunday.monday) + " and " + Utils.formatDate(mondayAndSunday.sunday));
			if(data.responsible != undefined) {
				$("#responsible").text(data.responsible.name);
				$("#responsible").attr("href", "mailto:"+data.responsible.email);
			}

            this.conf.generalPluginToUse.forEach(function(pluginName) {
                let plugin = new global[pluginName](thisObject.conf, thisObject.contextData);
                plugin.getInfo();
            });

			// module part
			data.projects.forEach( function (project) {
				thisObject.addModule(project,mondayAndSunday.monday,mondayAndSunday.sunday);
			});
			$('#chooseYourProject').hide();
			$('#dashboardContainer').show();
		} else {
			$('#chooseYourProject').show();
			$('#dashboardContainer').hide();
		}
	}

	addModule(project, beginDate, endDate) {
		let id = project.name;
		let projectSelector = "#"+id;
		let projectDetail1 = $("#projectDetail").clone();
		projectDetail1.find("div:first").attr("id",id);
		$( "#dashboardContainer" ).append( projectDetail1.html() );


        let contextModuleData = Object();
        contextModuleData.module = project;
        contextModuleData.selector = projectSelector;


		Utils.modifyElmt($(projectSelector), "projectName", id);
		Utils.modifyElmt($(projectSelector), "infoLabel", "Between "+ Utils.formatDate(beginDate) +" and " + Utils.formatDate(endDate));

		let thisObject = this;
        this.conf.modulePluginToUse.forEach(function(pluginName) {
            let plugin = new global[pluginName](thisObject.conf, thisObject.contextData, contextModuleData);
            plugin.getInfo();
        });
	}
}



var mondayAndSunday;

var mapProjectConfiguration = new Array();



/**
 * Redifined to date string to display automaticaly a beautiful date
 *
 */
Date.prototype.toString = function() {
	var day = this.getDate();
	var month = this.getMonth() + 1 ;
	var year = this.getFullYear();

	return year + '-' + (month<10 ? "0":"") + month + '-' + (day<10 ? "0":"") + day;

}
