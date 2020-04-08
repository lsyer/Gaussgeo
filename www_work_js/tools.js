
	
	function convertGeo(){
		var tt,lot,lat,xt,yt;
		if ($('#GaussToL').is(':checked')){
			if ( 1 == llFormat ){
				lot = parseFloat('0' + DegreeConvertBack($('#longitudeT').val()));
				lat = parseFloat('0' + DegreeConvertBack($('#latitudeT').val()));
			}else{
				lot = parseFloat('0' + $('#longitudeT').val());
				$('#longitudeT').val(lot);
				lat = parseFloat('0' + $('#latitudeT').val());
				$('#latitudeT').val(lat);
			}
			tt = GaussProjCal(lot, lat, m, c);
			xt = tt[0] + x_re;
			yt = tt[1] + y_re;
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
			if ( 1 == llFormat ){
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
			if ( 1 == llFormat ){
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
			SX = tt[0] + x_re;
			SY = tt[1] + y_re;
			tt = GaussProjCal(DX, DY, m, c);
			DX = tt[0] + x_re;
			DY = tt[1] + y_re;			
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
	
//打开数据库  
var db = openDatabase('pointdb','','Points Info Storage Database',204800);  

//保存航点，主界面使用 
function savePoint(){
	if(tp==null)
		return;
		
    var pointname = '未命名'; 
    var pointx = tp.coords.longitude;
    var pointy = tp.coords.latitude;
	
	addPoint(pointname,pointx,pointy);
}  
//新增航点，手动添加  
function addPoint2(){
			var name = "未命名";
			var x="",y="";
			if(tp != null){
				x = tp.coords.longitude;
				y = tp.coords.latitude;
				if(m != 0){
					var t= GaussProjCal(x, y, m, c);
					x=t[0] + x_re;
					y=t[1] + y_re;
				}else if( 1 == llFormat){
					x = formatDegree(x);
					y = formatDegree(y);
				}
			}
			
			$.afui.popup({
				title: "新增航点",
				message: "航点名: <input type='text' id='pointname' class='af-ui-forms' value='"+name+"'><br>X坐标: <input type='text' id='pointx' class='af-ui-forms' value='"+x+"'><br>Y坐标: <input type='text' id='pointy' class='af-ui-forms' value='"+y+"'>",
				cancelText: "取消",
				cancelCallback: function () {},
				doneText: "确定",
				doneCallback: function () {
					//alert(name);
					name=$("#pointname").val();
					x=$("#pointx").val();
					y=$("#pointy").val();
					var rArr=checkPoint(x,y);
					x=rArr[0];
					y=rArr[1];
					addPoint(name,x,y);
				},
				cancelOnly: false
			});	
}  
//输入的x/y转换为小数经纬度格式，以便存入数据库
function checkPoint(x,y){
	var rArr=[x,y];
    if(m != 0){
		var t= GaussProjInvCal( x - x_re, y - y_re, m, c);
		rArr=[t[0],t[1]];
	}else if( 1 == llFormat){
		rArr[0] = DegreeConvertBack(x);
		rArr[1] = DegreeConvertBack(y);
	}
	return rArr;
} 
//增加航点  
function addPoint(name,x,y){
    //创建时间  
    var time = new Date().getTime();  
    db.transaction(function(tx){  
        tx.executeSql('insert into points values(?,?,?,?)',[name,x,y,time],onPointMngSuccess,onPointMngError);  
    });  
}  

//更新数据  
function updatePoint(id,name,x,y){
			$.afui.popup({
				title: "修改航点",
				message: "航点名: <input type='text' id='pointname' class='af-ui-forms' value='"+name+"'><br>X坐标: <input type='text' id='pointx' class='af-ui-forms' value='"+x+"'><br>Y坐标: <input type='text' id='pointy' class='af-ui-forms' value='"+y+"'>",
				cancelText: "取消",
				cancelCallback: function () {},
				doneText: "确定",
				doneCallback: function () {
					//alert(id);
					name=$("#pointname").val();
					x=$("#pointx").val();
					y=$("#pointy").val();
					var rArr=checkPoint(x,y);
					x=rArr[0];
					y=rArr[1];
					db.transaction(function(tx){  
						tx.executeSql('update points set name=? ,x=? ,y=? where rowid=?',[name,x,y,id],onPointMngSuccess,onPointMngError);  
					});  
				},
				cancelOnly: false
			});		
}  
 //sql语句执行成功后执行的回调函数  
function onPointMngSuccess(tx,rs){
	$.afui.toast({
		message:"操作成功！",
		position:"tc",
		delay:3000,
		autoClose:true,
		type:"success"
	});
    loadPointsList();  
}  
//sql语句执行失败后执行的回调函数  
function onPointMngError(tx,error){
	$.afui.toast({
		message:"操作失败，失败信息："+ error.message,
		position:"tc",
		delay:3000,
		autoClose:true,
		type:"success"
	});
}

	//将所有存储在sqlLite数据库中的航点全部取出来  
function loadPointsList(){  
    var list = document.getElementById("pointsList");  
    db.transaction(function(tx){  
        //如果数据表不存在，则创建数据表
        tx.executeSql('create table if not exists points(name text,x text,y text,createtime INTEGER)',[]);  
        //查询所有航点记录  
        tx.executeSql('select rowid,* from points',[],function(tx,rs){  
           if(rs.rows.length>0){  
                var result = "";
                for(var i=0;i<rs.rows.length;i++){  
                    var row = rs.rows.item(i);  
                    //转换时间，并格式化输出  
                    var time = new Date();  
                    time.setTime(row.createtime);  
                    var timeStr = time.format("yyyy-MM-dd hh:mm:ss");
					var px=row.x;
					var py=row.y;
					if(m != 0){
						var t= GaussProjCal(px, py, m, c);
						px=t[0] + x_re;
						py=t[1] + y_re;
					}else if( 1 == llFormat){
						px = formatDegree(px);
						py = formatDegree(py);
					}
                    //拼装一个表格的行节点    
                    result += "<div class='card' withid='"+row.rowid+"' withname='"+row.name+"' withx='"+px+"' withy='"+py+"'><h3 class='plist'>"+row.rowid+". "+row.name+"</h3><h2 class='plist'>"+timeStr+"</h2><div class='plist'></div><h2 class='plist2'>X坐标: "+px+"</h2><h2 class='plist2'>Y坐标: "+py+"</h2></div>";
                }  
                list.innerHTML = result;
           }else{  
                list.innerHTML = "还没有保存航点！";  
           }   
        });  
    });  
}  
//删除航点信息  
function delPoint(rowid){  
			$.afui.popup({
				title: "警告！",
				message: "确认删除该航点？",
				cancelText: "取消",
				cancelCallback: function () {
					//console.log("cancelled");
				},
				doneText: "确认",
				doneCallback: function () {
					 db.transaction(function(tx){  
						//注意这里需要显示的将传入的参数phone转变为字符串类型  
						tx.executeSql('delete from points where rowid=?',[Number(rowid)],onPointMngSuccess,onPointMngError);  
					}); 
				},
				cancelOnly: false
			}); 
}  
//清除航点信息  
function clearPoint(){  
			$.afui.popup({
				title: "警告！警告！",
				message: "确认清除所有航点？此操作不可恢复！",
				cancelText: "取消",
				cancelCallback: function () {
					//console.log("cancelled");
				},
				doneText: "确认",
				doneCallback: function () {
					 db.transaction(function(tx){  
						//注意这里需要显示的将传入的参数phone转变为字符串类型  
						tx.executeSql('delete from points where 1=1',[],onPointMngSuccess,onPointMngError);  
					});
				},
				cancelOnly: false
			}); 
}  

Date.prototype.format = function(format)  
{  
    var o = {  
    "M+" : this.getMonth()+1, //month  
    "d+" : this.getDate(),    //day  
    "h+" : this.getHours(),   //hour  
    "m+" : this.getMinutes(), //minute  
    "s+" : this.getSeconds(), //second  
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter  
    "S" : this.getMilliseconds() //millisecond  
    }  
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,  
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));  
    for(var k in o)if(new RegExp("("+ k +")").test(format))  
    format = format.replace(RegExp.$1,  
    RegExp.$1.length==1 ? o[k] :  
    ("00"+ o[k]).substr((""+ o[k]).length));  
    return format;  
}  