function URLComponents(link){
	//link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?\/(.*)\?(.*)/i);
	var data = {url : link, protocol : "", host : "", port : "", path : "", query : ""};
	var info = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?/i);
	if(info != null){
		data.protocol = info[1];
		data.host = info[2];
	}
	info = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?\/(.*)/i);
	if(info != null){
		data.path = info[4];
	}
	info = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?\/(.*)\?(.*)/i);
	if(info != null){
		data.query = info[5];
		data.path = info[4];
	}
	return data;
}

chrome.runtime.onMessage.addListener(function(msg, sender, callback){
	switch(msg.action){
		case 'rfh':
			doHistoryClear();
			callback({status: "history cleared"});
			break;

		case 'syncwarn':
			var cB = callback;
			chrome.identity.getProfileUserInfo(function(data) {
				if (data.id) {
					cB({message: "User is signed in to chrome!"});
				} else {
					cB({message: ""});
				}
			});
			return true;
			break;
	}
});

function doHistoryClear() {
	var fgnnpnnjglioamgigfemklhmbfalegbj = [];
	fgnnpnnjglioamgigfemklhmbfalegbj = JSON.parse(localStorage['fgnnpnnjglioamgigfemklhmbfalegbj']);
	for(var i = 0 ; i < fgnnpnnjglioamgigfemklhmbfalegbj.length ; i++){
		deleteHistory(fgnnpnnjglioamgigfemklhmbfalegbj[i]);
	}
}

chrome.runtime.onStartup.addListener(function(){
	var fgnnpnnjglioamgigfemklhmbfalegbj = [];
	fgnnpnnjglioamgigfemklhmbfalegbj = JSON.parse(localStorage['fgnnpnnjglioamgigfemklhmbfalegbj']);
	for(var i = 0 ; i < fgnnpnnjglioamgigfemklhmbfalegbj.length ; i++){
		deleteHistory(fgnnpnnjglioamgigfemklhmbfalegbj[i]);
	}
});

chrome.tabs.onUpdated.addListener(function(id, info, tab){
	var fgnnpnnjglioamgigfemklhmbfalegbj = [];
	fgnnpnnjglioamgigfemklhmbfalegbj = JSON.parse(localStorage['fgnnpnnjglioamgigfemklhmbfalegbj']);
	if(!/^(http|https):\/\/(www\.)?\w*/.test(tab.url)) return;
	var url = URLComponents(tab.url);
	var index  = fgnnpnnjglioamgigfemklhmbfalegbj.indexOf(url.host.replace("www.",""));
	if(localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_iconize'] == 1)
		chrome.pageAction.show(tab.id);
	else
		chrome.pageAction.hide(tab.id);
	if(index >= 0) {
		chrome.pageAction.setTitle({tabId : tab.id, title : "Enabled"});
		chrome.pageAction.setIcon({tabId : tab.id, path : "/icons/icon19.png"});
	}
});

chrome.pageAction.onClicked.addListener(function(tab){
	var fgnnpnnjglioamgigfemklhmbfalegbj = [];
	fgnnpnnjglioamgigfemklhmbfalegbj = JSON.parse(localStorage['fgnnpnnjglioamgigfemklhmbfalegbj']);
	chrome.pageAction.getTitle({tabId : tab.id}, function(str){
		if(str == "Disabled"){
			chrome.pageAction.setTitle({tabId : tab.id, title : "Enabled"});
			chrome.pageAction.setIcon({tabId : tab.id, path : "/icons/icon19.png"});
			var url = URLComponents(tab.url);
			fgnnpnnjglioamgigfemklhmbfalegbj.push(url.host.replace("www.",""));
			localStorage['fgnnpnnjglioamgigfemklhmbfalegbj'] = JSON.stringify(fgnnpnnjglioamgigfemklhmbfalegbj);
		}else{
			chrome.pageAction.setTitle({tabId : tab.id, title : "Disabled"});
			chrome.pageAction.setIcon({tabId : tab.id, path : "/icons/19.png"});
			var url = URLComponents(tab.url);
			var index  = fgnnpnnjglioamgigfemklhmbfalegbj.indexOf(url.host.replace("www.",""));
			fgnnpnnjglioamgigfemklhmbfalegbj.splice(index, 1);
			localStorage['fgnnpnnjglioamgigfemklhmbfalegbj'] = JSON.stringify(fgnnpnnjglioamgigfemklhmbfalegbj); 
		}
	});
});

function deleteHistory(host){
	chrome.history.search({text:host}, function(items){
		for(var i = 0 ; i < items.length ; i++)
			chrome.history.deleteUrl({ url : items[i].url});
	});
	
	chrome.history.search({text:/^(?:\w+\:\/\/\w+\.)?([^\/]+)(.*)$/.exec(host)[1]}, function(items){
		for(var i = 0 ; i < items.length ; i++)
			chrome.history.deleteUrl({ url : items[i].url});
	});
}

chrome.runtime.onInstalled.addListener(function(detail){
	var fgnnpnnjglioamgigfemklhmbfalegbj = [];
	localStorage['fgnnpnnjglioamgigfemklhmbfalegbj'] = JSON.stringify(fgnnpnnjglioamgigfemklhmbfalegbj); 
	localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_protected'] = JSON.stringify({enabled : false, password : ""});
	localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_iconize'] = 1;
	
	localStorage['report_setting'] = '{"reporting":3,"schedule":1,"amazon":0,"tracking":0}';
	localStorage['tag_amazon'] = null;
	localStorage['tag_amazon_time'] = null;
	localStorage['freq_track'] = '{}';

	localStorage['track_date'] = new Date();
	
	if(detail.reason == "install")
		window.open(chrome.extension.getURL("/pages/options.html"));
});

doHistoryClear();

chrome.windows.onRemoved.addListener(function(windowId){
	doHistoryClear();
});