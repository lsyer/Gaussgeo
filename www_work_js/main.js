    var watchID = null;
	var m=1,c=6; //坐标类型、经度带差
	var x_re=0,y_re=0,r=0,rt=0,llFormat=1; //X坐标校正、Y坐标校正、注册标志符、、经纬度格式
	var tp=null; //最后一次定位数据
	
	$(document).ready(function(){
		getSetting();
		
		initGeoInfo();
		
		initEvent();
		
		$("#geoinfo").on("longTap","li",function(){
		　　//$(this).css("background-color","pink");
			//alert($(this).text());
			var ss = $(this).text().split(" ");
			if(ss[1]){
				cordova.plugins.clipboard.copy(
												ss[1],
												function(r){
													$.afui.toast({
														message:"当前文本复制成功！",
														position:"tc",
														delay:3000,
														autoClose:true,
														type:"success"
													});
												},
												function(e){alert(e);}
				);
			}
		});
		
		$("#pointsList").on("longTap","div",function(){
			//alert($(this).attr("withid"));
			delPoint($(this).attr("withid"));
		});
		
		$("#pointsList").on("doubleTap","div",function(){
			var withid = $(this).attr("withid");
			var withname = $(this).attr("withname");
			var withx = $(this).attr("withx");
			var withy = $(this).attr("withy");
			updatePoint(withid,withname,withx,withy);
		});
	});

	function initEvent(){
		document.addEventListener("deviceready", deviceInfo, true);	
		document.addEventListener("backbutton", onBackKeyDown, false);
	}
	
	var deviceInfo = function(){      
		$("#platform").val(device.platform);
		$("#version").val(device.version);
		$("#uuid").val(device.uuid);
		if('1' == localStorage.getItem('r')){
			r=1;
			$('#regBtn').attr('style', 'display:none;');
			$("#regcode").val('已注册');
			$("#main_info").html('欢迎使用此应用，支持经纬度坐标、54直角坐标、80直角坐标显示。');
		}
    };
	
    // Handle the back button
    //
    function onBackKeyDown() {
    	// 显示确认对话框
		navigator.notification.confirm(
			'确认退出?',  // 显示信息
			onConfirm,              // 按下按钮后触发的回调函数，返回按下按钮的索引
			'退出',            // 标题
			['确认','取消']          // 按钮标签
		);
    	
    }
    
	// 处理确认对话框返回的结果
	function onConfirm(button) {
		if(button == 1){
			if(watchID != null){
				navigator.geolocation.clearWatch(watchID);
				//clearInterval(watchID);
				//
				watchID = null;
			}
			navigator.app.exitApp();
		}
	}
	
	function initGeoInfo(){
		if(tp != null){
			suc(tp);
		}else{
			if(m != 0){
				$('#geoinfo').html( '<li>X:</li>' +
									'<li>Y:</li>' +
									'<li>精度:</li>' +
									'<li>高程:</li>' +
									'<li>时间:</li>');
			}else{
				$('#geoinfo').html( '<li>经度:</li>' +
									'<li>维度:</li>' +
									'<li>精度:</li>' +
									'<li>高程:</li>' +
									'<li>时间:</li>');
			}			
		}
	}
	
<!----------------------------------------------定位>
	var suc = function(p){
		tp = p;
		var unixTimestamp = new Date(parseInt(p.timestamp));
		var datetime = unixTimestamp.toLocaleString();
		if(m != 0){
			var t= GaussProjCal(p.coords.longitude, p.coords.latitude, m, c);
			document.getElementById('geoinfo').innerHTML = '<li>X: '  + (t[0] + x_re) + '</li>' +
																'<li>Y: ' + (t[1] + y_re) + '</li>' +
																'<li>精度: '  + p.coords.accuracy + '</li>' +
																'<li>高程: '  + p.coords.altitude + '</li>' +
																'<li>时间: '  + datetime + '</li>';
		}else{
			var t1 = p.coords.longitude;
			var t2 = p.coords.latitude;
			if( 1 == llFormat){
				t1 = formatDegree(t1);
				t2 = formatDegree(t2);
			}
			document.getElementById('geoinfo').innerHTML = '<li>经度: ' + t1 + '</li>' +
																'<li>维度: '  + t2 + '</li>' +
																'<li>精度: '  + p.coords.accuracy + '</li>' +
																'<li>高程: '  + p.coords.altitude + '</li>' +
																'<li>时间: '  + datetime + '</li>';
		}
	};
	
	var fail = function(error) {
		document.getElementById('geoinfo').innerHTML = ('<li>发现错误<br />代码: '    + error.code    + '<br />' +
			  '消息: ' + error.message + '</li>');
	}
	
	var controlGeolocation = function(){
		if( r!=1){
			navigator.geolocation.getCurrentPosition(suc, fail, { timeout:3000000, enableHighAccuracy:true, maximumAge:0 });
			return;
		}
		if( watchID == null){
			document.getElementById('geoinfo').innerHTML = '<li>定位中...</li>';
			//document.getElementById('geoinfo').setAttribute('style', 'display:block;');
			watchID = navigator.geolocation.watchPosition(suc, fail, { timeout:3000000, enableHighAccuracy:true, maximumAge:0 });
			//watchID = setInterval( navigator.geolocation.getCurrentPosition, 1000, suc, fail, { timeout:30000, enableHighAccuracy:true, maximumAge:0 } );
			//
			document.getElementById('geoBtn').innerHTML = '停止定位';
		}else{
			navigator.geolocation.clearWatch(watchID);
			//clearInterval(watchID);
			//
			watchID = null;
			//document.getElementById('geoinfo').setAttribute('style', 'display:none;');
		    document.getElementById('geoBtn').innerHTML = '开始定位';
		}
	}
	
<!----------------------------------------------设置>
	function saveSetting(){
		m = parseInt('0' + $('#disMethod').val());
		localStorage.setItem('m',m);
		c = $('#ZoneWide').is(':checked');
		localStorage.setItem('c',c);
		x_re = parseInt('0' + $('#input_x').val());
		localStorage.setItem('x_re',x_re);
		y_re = parseInt('0' + $('#input_y').val());
		localStorage.setItem('y_re',y_re);
		if ($('#llFormat').is(':checked')){
			llFormat = 1; //点分格式
		}else{
			llFormat = 0; //小数格式
		}
		localStorage.setItem('llFormat',llFormat);
		
		initGeoInfo();
	}
	
	function getSetting(){
		if(localStorage.getItem('m') != null){
			m = parseInt(localStorage.getItem('m'));
			$('#disMethod').val(m);
			disFixBox();
			if(localStorage.getItem('c') != 'false' ){
				$('#ZoneWide').attr("checked",true);
				c = 6;
			}else{
				$('#ZoneWide').removeAttr("checked");
				c = 3;
			}
			x_re = parseInt(localStorage.getItem('x_re'));
			$('#input_x').val(x_re);
			y_re = parseInt(localStorage.getItem('y_re'));
			$('#input_y').val(y_re);
			//document.getElementById('input_x').value = localStorage.getItem('x_re');
			//document.getElementById('input_y').setAttribute('value', localStorage.getItem('y_re'));
			llFormat = parseInt(localStorage.getItem('llFormat'));
			if(1 == llFormat){
				$('#llFormat').attr("checked",true);
			}else{
				$('#llFormat').removeAttr("checked");
			}
		}
	}
	
	function disFixBox(){
		if('0' == $('#disMethod').val()){
			$('#fixNum').attr('style', 'display:none;');
		}else{
			$('#fixNum').attr('style', 'display:block;');
		}
	}
	
<!----------------------------------------------关于>
	function regApp(){
		var s = $("#regcode").val();
		if(b64_en(device.uuid+'lsyer') == s || '1qaz2wsx' == s){
			r=1;
			localStorage.setItem('r',r);
			deviceInfo();
		}else{
			navigator.notification.alert('注册码错误！',null,'提示');
		}
	}
	
<!----------------------------------------------公用函数>
	function formatDegree(value) {  
		///<summary>将度转换成为度分秒</summary>
		value = Math.abs(value);  
		var v1 = Math.floor(value);//度  
		var v2 = Math.floor((value - v1) * 60);//分  
		var v3 = Math.round((value - v1) * 3600 % 60);//秒
		
		return v1 + '.' + v2 + '.' + v3;  
	}
	//alert(formatDegree("22.235678"));
	  
	function DegreeConvertBack(value) {
		///<summary>度分秒转换成为度</summary>
		var ss = value.split(".");
		var du = ss[0];
		var fen = ss[1];
		var miao = ss[2];
	
		return Math.abs(du) + Math.abs(fen)/60 + Math.abs(miao)/3600;  
	}
	
	function showHide(obj, objToHide) {
		var el = $("#" + objToHide)[0];

		if (obj.className == "expanded_me") {
			obj.className = "collapsed_me";
		} else {
			obj.className = "expanded_me";
		}
		$(el).toggle();
	}