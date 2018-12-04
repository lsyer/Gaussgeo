    var watchID = null;
	var m=1,c=6;
	var x=0,y=0,r=0,rt=0;
	var tp=null;
	
	$(document).ready(function(){
		getSetting();
		
		$("#geoinfo").on("longTap","li",function(){
		　　//$(this).css("background-color","pink");
			//alert($(this).text());
			cordova.plugins.clipboard.copy(
											$(this).text(),
											function(r){navigator.notification.alert("当前文本复制成功！",null,'提示')},
    										function(e){alert(e)}
			);
		});
		
	});
	
	function initGeoInfo(){
		if(tp != null){
			suc(tp);
		}else{
			if(m != 0){
				$('#geoinfo').html( '<li>X: </li>' +
									'<li>Y: </li>' +
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
	
	var suc = function(p){
		tp = p;
		var unixTimestamp = new Date(parseInt(p.timestamp));
		var datetime = unixTimestamp.toLocaleString();
		if(m != 0){
			var t= GaussProjCal(p.coords.longitude, p.coords.latitude, m, c);
			document.getElementById('geoinfo').innerHTML = '<li>X: '  + (t[0] + x) + '</li>' +
																'<li>Y: ' + (t[1] + y) + '</li>' +
																'<li>精度: '  + p.coords.accuracy + '</li>' +
																'<li>高程: '  + p.coords.altitude + '</li>' +
																'<li>时间: '  + datetime + '</li>';
		}else{
			document.getElementById('geoinfo').innerHTML = '<li>经度: ' + p.coords.longitude + '</li>' +
																'<li>维度: '  + p.coords.latitude + '</li>' +
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
			navigator.geolocation.getCurrentPosition(suc, fail, { timeout:30000, enableHighAccuracy:true, maximumAge:0 });
			return;
		}
		if( watchID == null){
			document.getElementById('geoinfo').innerHTML = '<li>定位中...</li>';
			//document.getElementById('geoinfo').setAttribute('style', 'display:block;');
			watchID = navigator.geolocation.watchPosition(suc, fail, { timeout:30000, enableHighAccuracy:true, maximumAge:0 });
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
	
	function saveSetting(){
		m = parseInt('0' + $('#disMethod').val());
		localStorage.setItem('m',m);
		c = $('#ZoneWide').is(':checked');
		localStorage.setItem('c',c);
		x = parseInt('0' + $('#input_x').val());
		localStorage.setItem('x',x);
		y = parseInt('0' + $('#input_y').val());
		localStorage.setItem('y',y);
		
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
			x = parseInt(localStorage.getItem('x'));
			$('#input_x').val(x);
			y = parseInt(localStorage.getItem('y'));
			$('#input_y').val(y);
			//document.getElementById('input_x').value = localStorage.getItem('x');
			//document.getElementById('input_y').setAttribute('value', localStorage.getItem('y'));
		}
		
		initGeoInfo();
	}
	
	function disFixBox(){
		if('0' == $('#disMethod').val()){
			$('#fixNum').attr('style', 'display:none;');
		}else{
			$('#fixNum').attr('style', 'display:block;');
		}
	}
	
	function convertGeo(){
		var tt,lot,lat,xt,yt;
		if ($('#GaussToL').is(':checked')){
			if ($('#llFormat').is(':checked')){
				lot = parseFloat('0' + DegreeConvertBack($('#longitudeT').val()));
				lat = parseFloat('0' + DegreeConvertBack($('#latitudeT').val()));
			}else{
				lot = parseFloat('0' + $('#longitudeT').val());
				$('#longitudeT').val(lot);
				lat = parseFloat('0' + $('#latitudeT').val());
				$('#latitudeT').val(lat);
			}
			tt = GaussProjCal(lot, lat, m, c);
			xt = tt[0] + x;
			yt = tt[1] + y;
			$('#xT').val(xt);
			$('#yT').val(yt);
		}else{
			xt = parseFloat('0' + $('#xT').val());
			$('#xT').val(xt);
			yt = parseFloat('0' + $('#yT').val());
			$('#yT').val(yt);
			tt = GaussProjInvCal(xt, yt, m, c);
			lot = tt[0];
			lat = tt[1];
			if ($('#llFormat').is(':checked')){
				lot = formatDegree(lot);
				lat = formatDegree(lat);
			}
			$('#longitudeT').val(lot);
			$('#latitudeT').val(lat);
		}
	}
	
	function azimuthCal(){
		var SX,SY,DX,DY,angleNum,azimuthNum;
		SX = $('#SX').val();
		SY = $('#SY').val();
		DX = $('#DX').val();
		DY = $('#DY').val();
		if ($('#azimuthFormat').is(':checked') != true){
			if ($('#llFormat2').is(':checked')){
				SX = parseFloat('0' + DegreeConvertBack(SX));
				SY = parseFloat('0' + DegreeConvertBack(SY));
				DX = parseFloat('0' + DegreeConvertBack(DX));
				DY = parseFloat('0' + DegreeConvertBack(DY));
			}else{
				SX = parseFloat('0' + SX);
				SY = parseFloat('0' + SY);
				DX = parseFloat('0' + DX);
				DY = parseFloat('0' + DY);
			}
			var tt;
			tt = GaussProjCal(SX, SY, m, c);
			SX = tt[0] + x;
			SY = tt[1] + y;
			tt = GaussProjCal(DX, DY, m, c);
			DX = tt[0] + x;
			DY = tt[1] + y;			
		}else{
			SX = parseFloat('0' + SX);
			SY = parseFloat('0' + SY);
			DX = parseFloat('0' + DX);
			DY = parseFloat('0' + DY);
		}
		if(DY==SY && DX==SX){
			$('#angleNum').val("Error.");	
			$('#azimuthNum').val("Error.");
		}else{
			var angle;
			var rad = Math.atan((DX-SX)/(DY-SY));
			angle = rad * 180 / Math.PI;
			if(DX > SX && DY > SY){
				angle = angle;
			}else if(DX > SX && DY < SY){
				angle = angle + 180;
			}else if(DX < SX && DY < SY){
				angle = angle + 180;
			}else if(DX < SX && DY > SY){
				angle = angle + 360;
			}else if(DY==SY){
				if(DX>SX){
					angle = 90;
				}else if(DX<SX){
					angle = 270;
				}
			}else if(DX==SX){
				if(DY>SY){
					angle = 0;
				}else if(DY<SY){
					angle = 180;
				}
			}
			$('#angleNum').val(angle);	
			$('#azimuthNum').val(angle*6000/360);
		}
	}
	
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

	function init(){
		document.addEventListener("deviceready", deviceInfo, true);	
		document.addEventListener("backbutton", onBackKeyDown, false);
	}
	
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
	
	function showHide(obj, objToHide) {
		var el = $("#" + objToHide)[0];

		if (obj.className == "expanded_me") {
			obj.className = "collapsed_me";
		} else {
			obj.className = "expanded_me";
		}
		$(el).toggle();
	}