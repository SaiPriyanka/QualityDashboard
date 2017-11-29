class CerberusTagInfo extends GetAndFillInfo {

	constructor(cerberusTag, callback) {
		super();
		this.callback=callback;
		this.cerberusTag=cerberusTag;
	}

	getUrl() {
		return serverUrl + "/getLastTagCerberus?prefixTag=" + this.cerberusTag;
	}

	isParameterSpecified() {
		return this.cerberusTag !=undefined && this.cerberusTag != '';	
	}
	
	getResult(msg) {
		return msg[0];			
	}

	fillInfo(cerberusInfo) {
		this.callback(cerberusInfo);
	}

}
global["CerberusTagInfo"]=CerberusTagInfo;