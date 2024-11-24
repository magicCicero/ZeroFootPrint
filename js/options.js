var fgnnpnnjglioamgigfemklhmbfalegbj = JSON.parse(localStorage['fgnnpnnjglioamgigfemklhmbfalegbj']);
var fgnnpnnjglioamgigfemklhmbfalegbj_protected = JSON.parse(localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_protected']);

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

function load(){
	var body = document.getElementById('table');
	body.innerHTML = "";
	//console.log(fgnnpnnjglioamgigfemklhmbfalegbj);
	for(var i = 0 ; i < fgnnpnnjglioamgigfemklhmbfalegbj.length ; i++){
		var tr = body.appendChild(document.createElement('div'));
		
		tr.appendChild(document.createElement('div')).textContent = fgnnpnnjglioamgigfemklhmbfalegbj[i];
		var a = tr.appendChild(document.createElement('div'));
		a.index = i;
		a.textContent = "X";
		a.setAttribute('class', 'x-btn');
		a.onclick = function(){
			body.removeChild(this.parentNode);
			//console.log(fgnnpnnjglioamgigfemklhmbfalegbj[this.index]);
			fgnnpnnjglioamgigfemklhmbfalegbj.splice(this.index, 1);
			localStorage['fgnnpnnjglioamgigfemklhmbfalegbj'] = JSON.stringify(fgnnpnnjglioamgigfemklhmbfalegbj); 
			load();
		}
	}
	
	if(!fgnnpnnjglioamgigfemklhmbfalegbj_protected.enabled){
		document.getElementById('password').setAttribute('disabled','');
		document.getElementById('pwdBtn').setAttribute('disabled','');
		document.getElementById('resetBtn').setAttribute('disabled','');
		
	}else{
		document.getElementById('password').removeAttribute('disabled');
		document.getElementById('pwdBtn').removeAttribute('disabled');
		document.getElementById('resetBtn').removeAttribute('disabled');
		document.getElementById('pwdBtn').value = "Change password";
	}
	document.getElementById('checkbox').checked = fgnnpnnjglioamgigfemklhmbfalegbj_protected.enabled;
	document.getElementById('password').value = fgnnpnnjglioamgigfemklhmbfalegbj_protected.password;
	
	document.getElementById('hide').checked = localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_iconize'] == 0 ? true : false;
	
	chrome.runtime.sendMessage(null, {action : "syncwarn" , data : null}, function(msg){
		if(msg['message'].length > 0)
			document.getElementById('syncwarn_wrap').setAttribute('style', 'display:block;width:100%;background-color:red;padding:4px;border:1px solid #333');
	});
}

function logged(bool){
	if(bool){
		document.getElementById('panel').style.display = "block";
		document.getElementById('box').style.display = "none";
	}else{
		document.getElementById('panel').style.display = "none";
		document.getElementById('box').style.display = "block";
	}
}

window.onload = function(){
	load();
	document.getElementById('addBtn').onclick = function(){
		var value = document.getElementById('url').value;
		if(!/^(http|https):\/\/(www\.)?\w*/.test(value)){
			alert('Invalid URL format !');
			return;
		}
		
		value = URLComponents(value);
		value = value.host.replace("www.","")
		
		var index  = fgnnpnnjglioamgigfemklhmbfalegbj.indexOf(value);
		if(index >= 0) return;
		fgnnpnnjglioamgigfemklhmbfalegbj.push(value);
		localStorage['fgnnpnnjglioamgigfemklhmbfalegbj'] = JSON.stringify(fgnnpnnjglioamgigfemklhmbfalegbj);
		load();
	}
	
	document.getElementById('checkbox').onclick = function(){
		if(!this.checked){
			document.getElementById('password').setAttribute('disabled','');
			document.getElementById('pwdBtn').setAttribute('disabled','');
			document.getElementById('resetBtn').setAttribute('disabled','');
			localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_protected'] = JSON.stringify({enabled : document.getElementById('checkbox').checked,
																					password : document.getElementById('password').value});
		}else{
			document.getElementById('password').removeAttribute('disabled');
			document.getElementById('pwdBtn').removeAttribute('disabled');
			document.getElementById('resetBtn').removeAttribute('disabled');
		}
	}
	
	document.getElementById('hide').onclick = function(){
		localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_iconize'] = this.checked ? 0 : 1;
	}
	
	document.getElementById('remBtn').onclick = function(){
		chrome.runtime.sendMessage(null, {action : "rfh" , data : null}, function(msg){
			alert("History cleared !");
		});
	}
	
	document.getElementById('pwdBtn').onclick = function(){
		localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_protected'] = JSON.stringify({enabled : document.getElementById('checkbox').checked,
																					password : document.getElementById('password').value});
		alert("Protection set !");
		location.reload();
	}
	
	document.getElementById('passBtn').onclick = function(){
		var value = document.getElementById('pwd').value;
		logged(value == fgnnpnnjglioamgigfemklhmbfalegbj_protected.password);
		
	}
	
	document.getElementById('resetBtn').onclick = function(){
		document.getElementById('pwd').value = "";
		localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_protected'] = JSON.stringify({enabled : false,
																					password : ""});
		alert("Protection removed !");
		location.reload();
	}
	
	logged(!fgnnpnnjglioamgigfemklhmbfalegbj_protected.enabled);
}