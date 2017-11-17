class JenkinsInfo extends GetAndFillInfo {

	constructor(globalSettings, contextData, contextModuleData) {
		super();
		this.projectSelector=contextModuleData.selector;
		this.jenkinsName=contextModuleData.module.jenkinsName;
	}

	getUrl() {
		return serverUrl + "/jenkinsinfo?project_name="+ this.jenkinsName;
	}

	checkPluginAvailable() {
        if(this.jenkinsName == undefined) return false;

        $(this.projectSelector + " [name='buildPanel']").show(); // show build panel
        return true;
    }

	getResult(msg) {
		return msg[0];
	}
		
	fillInfo(info) {
	    if(info.lastFailedBuild == null) {
                if(info.lastBuild != null) {
                        $(this.projectSelector + " [name='buildQuality']").text("OK");
                        $(this.projectSelector + " [name='buildQuality']").addClass("nice");
                }
                else {
                        $(this.projectSelector + " [name='buildQuality']").text("NA");
                }
        }
        else {
                $(this.projectSelector + " [name='buildQuality']").text(info.lastBuild.number===info.lastFailedBuild.number ? "KO" : "OK");
                $(this.projectSelector + " [name='buildQuality']").addClass(info.lastBuild.number===info.lastFailedBuild.number ? "bad" : "nice");
        }

        $(this.projectSelector + " [name='detailBuild']").text(info.healthReport[1].description);
        $(this.projectSelector + " [name='testQuality']").text(info.healthReport[0].description);
        $(this.projectSelector + " [name='linkLastBuild']").attr("href", info.lastBuild.url);				
	}
}
global["JenkinsInfo"]=JenkinsInfo;