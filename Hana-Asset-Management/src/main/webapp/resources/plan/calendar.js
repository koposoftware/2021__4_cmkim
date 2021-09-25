
/*******************************************************************************
 * 설명 : [calendar tag] : 날짜 변경시 값을 셋팅하고, 체크한다.
 * 			- selectbox의 경우 [dd일] select box를 재설정한다. - 년월에 따라 말일변경
 * 			- 값이 유효하지 않으면 value="" 
 * @param	o		: event srcElement object
 * @param	p_obj	: param object
 * @returns {없음}
 *******************************************************************************/
function calValidateAndSetVal(o, p_obj) {
	var f_id = p_obj.id;	// calendar element_id
	if(!f_id){ return; }
	
	// Calendar event srcElement||target : type
	var isY = $(o).is( $('#'+f_id+'Y') );			// SELBOX:년
	var isM = $(o).is( $('#'+f_id+'M') );			// SELBOX:월
	var isD = $(o).is( $('#'+f_id+'D') );			// SELBOX:일
	var isTxt = $(o).is( $('#'+f_id+'_txt') );		// INPUT
	var isCal = $(o).is( $('#calendar_div_'+f_id) );	// Calendar 날짜선택
	//alert( 'isY='+isY+' / isM='+isM+' / isD='+isD+' / isTxt='+isTxt+' / isCal='+isCal );
	
	var f_v = $('#'+f_id).val();	// calendar value (hidden)
	var y, m, d;	// string
	var format = p_obj.format;	
	var min = p_obj.minDate;
	var max = p_obj.maxDate;
	var ex_char	 = /[-~!\#$^&*\=+|:;?"<,.>']/;		 //특수문자
	var ex_char_re = /[-~!\#$^&*\=+|:;?"<,.>']/gi;	 //특수문자replace
	var bk_val = $('#'+f_id).val().replace(ex_char_re, '');	// 이전값 
	
	if( isY || isM || isD ){	// *event: SELBOX
		if( isY || isM ){
			setCalDaySelbox(f_id);
		}
		y = $('#'+ f_id +'Y').val();
		m = $('#'+ f_id +'M').val();
		d =  $('#'+ f_id +'D').val();
		f_v = y + m + d;
		// blank 관련
		if( (isY&&y=='') || (isM&&m=='') || (isD&&d=='') ){
			calSetVal(f_id, ''); return;
		}else if( (y=='') || (m=='') || (d=='') ){
			return;
		}
	}else if( isTxt ){	// *event: INPUT
		f_v = $(o).val().replace(ex_char_re, '');
		y = f_v.substring(0,4);
		m = f_v.substring(4,6);
		d = f_v.substring(6,8);
	}else if( isCal ){	// *event: Calendar Pick
		f_v = p_obj.val;	// pick value
		y = f_v.substring(0,4);
		m = f_v.substring(4,6);
		d = f_v.substring(6,8);
		
		if( $('#'+ f_id +'_txt').length == 0 ){	// SELBOX
			$('#'+ f_id+ 'Y').val( y );
			$('#'+ f_id+ 'M').val( m );
			setCalDaySelbox(f_id);
			$('#'+ f_id+ 'D').val( d );
		}else{	// INPUT
			var v_txt = y + format + m + format + d;
			$('#'+ f_id +'_txt').val( v_txt );
		}
	}
	
	// value validate
	var isValid = true;
	var msg_invalid = '';
	if( f_v.length == 8 && $.isNumeric( f_v ) ){
		var yyyy = parseInt(f_v.substr(0,4), 10);
		var mm = parseInt(f_v.substr(4,2), 10);
		var dd = parseInt(f_v.substr(6), 10);
		var tmp_dt = new Date(yyyy, mm-1, dd);
		if( tmp_dt.getFullYear() == yyyy && (tmp_dt.getMonth()+1) == mm && tmp_dt.getDate() == dd ){	// date check
			// valid0.1 : min~max Range
			if( min != '' && f_v < min  ){ 
				//var min_txt = min;
				var min_txt = min.substring(0,4) + '-' + min.substring(4,6) + '-' + min.substring(6,8);
				isValid = false; msg_invalid = '최소일자['+min_txt+'] 이후 날짜로 선택해주십시오.';
			}
			if(  max != '' && f_v > max  ){
				//var max_txt = max;
				var max_txt = max.substring(0,4) + '-' + max.substring(4,6) + '-' + max.substring(6,8);
				isValid = false; msg_invalid = '최대일자['+max_txt+'] 이전 날짜로 선택해주십시오.';
			}
			// valid0.2 : inspect 영업일체크
			if(p_obj.inspect == '1'){
				var h = '';
				if(isCal){
					h = p_obj.holidate;
				}else{
					// ajax check
					h = getWorkDay(f_v, p_obj.url_check);
				}
				
				if(h == '' || h == '1'){ 	// 영업일 OK
				} else {
					isValid = false; msg_invalid = "선택하신 날짜는 영업일이 아닙니다.\n\n다시 선택해 주십시오";
				}
			}
			
			var oper, stndDt, oper_msg;
			// valid1 : (f_v [oper1] [standardDate1])
			if(p_obj.standardDate1 != '' && p_obj.oper1 != ''){
				oper = p_obj.oper1.replace(/＆/gi, '&').replace(/＝/gi, '=').replace(/＜/gi, '<').replace(/＞/gi, '>');
				stndDt = $('#'+p_obj.standardDate1).val();
				if(!!stndDt){
					var stnd_p_obj = null;
					try{ stnd_p_obj = eval('cld_param_'+p_obj.standardDate1); }catch(e){}
					if( stnd_p_obj!=null ){
						if(stnd_p_obj.valFormat=='1'){
							if( ex_char.test( stndDt) ){ 
								stndDt = stndDt.replace(ex_char_re, '');
							}else{
								stndDt = stndDt.replace(new RegExp(stnd_p_obj.format), '');
							}
						}
					}
					oper_msg = p_obj.msg1;
					var isStndValid = eval( f_v + oper + stndDt );
					if(isStndValid){
						isValid = false; if(oper_msg!=''){ alert(oper_msg); }
					}
				}
			}
			// valid2 : (f_v [oper2] [standardDate2])
			if(p_obj.standardDate2 != '' && p_obj.oper2 != ''){
				oper = p_obj.oper2.replace(/＆/gi, '&').replace(/＝/gi, '=').replace(/＜/gi, '<').replace(/＞/gi, '>');
				stndDt = $('#'+p_obj.standardDate2).val();
				if(!!stndDt){
					var stnd_p_obj = null;
					try{ stnd_p_obj = eval('cld_param_'+p_obj.standardDate2); }catch(e){}
					if( stnd_p_obj!=null ){
						if(stnd_p_obj.valFormat=='1'){
							if( ex_char.test( stndDt) ){ 
								stndDt = stndDt.replace(ex_char_re, '');
							}else{
								stndDt = stndDt.replace(new RegExp(stnd_p_obj.format), '');
							}
						}
					}
					oper_msg = p_obj.msg2;
					var isStndValid = eval( f_v + oper + stndDt );
					if(isStndValid){
						isValid = false; if(oper_msg!=''){ alert(oper_msg); }
					}
				}
			}
			
		}else{
			isValid = false; //msg_invalid = '날짜가 유효하지 않습니다. \nvalue='+ f_v +' [YYYYMMDD]형식이 아닙니다. ';
		}
	}else{
		isValid = false; //msg_invalid = '날짜가 유효하지 않습니다. \nvalue='+ f_v +' [YYYYMMDD]형식이 아닙니다. ';
	}
	
	if( isValid ){
		// val set callback func
		if(typeof calCallBack == 'function'){
			if(!calCallBack( f_id, f_v )){
				calSetVal(f_id, bk_val);
				return;
			}
		}
		var real_value = f_v;
		if(p_obj.valFormat == '1'){ real_value = y +format+ m +format+ d; }
		$('#'+f_id).val( real_value ); // set value
		//alert(' set value ok : '+ $('input[name='+f_id+']').val() );
	}else{
		if(msg_invalid != ''){ alert( msg_invalid ); }
		calSetVal(f_id, bk_val);
		//$('input[name='+f_id+']').val( '' ); // set value
		//$('#'+f_id+'D, #'+f_id+'_txt, input[name='+f_id+']').val('');
		return;
	}
	
	if( isValid && isCal ){
		calendar_close( f_id );
	}
}

/*******************************************************************************
 * 설명 : [calendar tag] : [dd일] select box를 재설정한다. - 년월에 따라 말일변경
 * @param	f_id	 : calendar id
 * @returns {없음}
 *******************************************************************************/
function setCalDaySelbox(f_id){
	if(!f_id){ return; }
	var valY = parseInt( $('#'+ f_id +'Y').val() ,10);
	var valM = parseInt( $('#'+ f_id +'M').val() ,10);
	var valD = parseInt( $('#'+ f_id +'D').val() ,10);
	var p_obj = eval( 'cld_param_'+f_id );
	
	// Day option reset
	var f_day  = $('#'+ f_id +'D');
	if( isNaN(valY) || isNaN(valM) || $(f_day).length ==0 ){ return; }
	
	var endDay = Array( 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 );
	if ((valY % 4 == 0 && valY % 100 != 0) || valY % 400 == 0){ endDay[1] = 29; } // 윤년 계산
	
	$(f_day).html('');
	if(p_obj.blank == '1'){ $('<option value="" ></option>').appendTo( f_day );	} // 선택
	if(p_obj.descD == '1'){
		for(var i = endDay[valM - 1]; i >= 1; i--) {
			v = i;
			if(v < 10 ){ v ='0'+ v; }
			$('<option value="'+ v + '" >' + v +'</option>').appendTo( f_day );
		}
	}else{
		for(var i = 1; i <= endDay[valM - 1]; i++) {
			v = i;
			if(v < 10 ){ v ='0'+ v; }
			$('<option value="'+ v + '" >' + v +'</option>').appendTo( f_day );
		}
	}
	$(f_day).val( (valD<10?'0'+valD:valD) );
}

/*******************************************************************************
 * 설명 : [calendar tag] : calendar layer를 닫는다.
 * @param	f_id	 : calendar id
 * @returns {없음}
 *******************************************************************************/
function calendar_close( f_id ){
	var lp = $('#calendar_div_'+f_id).parents('.pop-wrap:first');
	$('#calendar_div_'+f_id).fadeOut(100, function() {
		$(this).remove();
	});
	if(lp.length > 0){
		$(lp).wbUI('repositionPopup');
		var layerOriHeight = $('.ly-body',lp).data('oriHeight');
		$('.ly-body',lp).css({height : layerOriHeight}).wbUI('repositionPopup');
	}
	$('#cld_a_'+ f_id).focus();
}

/*******************************************************************************
 * 설명 : 대상일자가 영업일인지 확인한다.
 * @param	sDate 	: 대상일자(yyyymmdd)
 * @param url			: 영업일체크 JSP ( jspeed_url )
 * @returns {1:영업일만, 2:반휴일(토요일포함), 4:휴일(일요일포함), 3:영업일+반휴일, 5:영업일+휴일, 6:반휴일+휴일, 7:All }
 *******************************************************************************/
function getWorkDay(sDate, url){
	if(!url){ url='jcc?withyou=CMCOM0064&__ID=c003128'; } //<wbf:jcc  id="c003128"/>  // /com/common/calendar_check.jsp
	var h_dt = ''; // 영업일구분
	var param = 'selDate='+sDate;
	$.ajax({
		url : url,
		data : param,
		type:'get',
		timeout: 5000,
		dataType: 'html',
		async:false,
		success : function( html ){
			var result = $(html).filter('#calendar_check_result').val();
			h_dt = result;
		},
		error: function(xhr){ /* alert('error: ' + xhr.status + ' ' + xhr.statusText); */ }
	});
	
	return h_dt;
}

/*******************************************************************************
 * 설명 : [calendar tag] : [기준일]부터 일/주/월 단위로 계산하여 [대상일]을 설정.
 * @param	isBefore 	:  true=이전으로 계산, false=이후로 계산
 * @param base_id 	: 기준일 calendar ID
 * @param target_id 	: 대상일 calendar ID
 * @param unit 		: 단위 ('D'=일, 'W'=주, 'M'=월)
 * @param val  		: 설정기간(0,1,2,3...)
 * @returns {없음}
 *******************************************************************************/
function setCalTerm(isBefore, base_id, target_id, unit, val){
	var b = $('#'+base_id);
	var t = $('#'+target_id);
	if(!b || !t){ 
		//alert('ERR :: setCalTerm :: 기준일/대상일 ID가 없습니다.'); 
		return;  
	}
	var i_val = parseInt( val, 10 );
	if( isNaN(i_val) ){ 
		//alert('ERR :: setCalTerm :: 설정기간은 숫자로 설정해주십시오.'); 
		return; 
	}
	
	var isTxt_b = ( $('#'+base_id+'_txt').length > 0 );	// base: input
	var isSel_b = ( $('#'+base_id+'Y').length > 0 );		// base: selbox
	var isTxt_t = ( $('#'+target_id+'_txt').length > 0 );	// target : input
	var isSel_t = ( $('#'+target_id+'Y').length > 0 );		// target : selbox
	if( !(isTxt_b || isSel_b || isTxt_t || isSel_t) ){ 
		//alert('ERR :: setCalTerm :: calendarTag에서만 동작합니다. '); 
		return; 
	}

	// 기준일 설정
	var b_y, b_m, b_d;
	var b_param = eval( 'cld_param_'+base_id );
	if(isTxt_b){
		var b_v = $('#'+base_id+'_txt').val().split( b_param.format );
		if(b_v.length != 3){
			//alert('ERR :: setCalTerm :: 기준일자['+ $('#'+base_id+'_txt').val() +']가 올바르지 않습니다.'); 
			return;
		}
		b_y = parseInt( b_v[0], 10 );
		b_m = parseInt( b_v[1], 10 );
		b_d = parseInt( b_v[2], 10 );
	}else if(isSel_b){
		b_y = parseInt( $('#'+base_id+'Y').val(), 10 );
		b_m = parseInt( $('#'+base_id+'M').val(), 10 );
		b_d = parseInt( $('#'+base_id+'D').val(), 10 );
	}
	if( isNaN(b_y) || isNaN(b_m) || isNaN(b_d) ){ return; }
	
	// 계산
	var b_dt = new Date( b_y, b_m-1, b_d  );
	if( unit == 'D' ){
		isBefore?(b_dt.setDate( b_dt.getDate() - i_val )) : (b_dt.setDate( b_dt.getDate() + i_val ));
		if(i_val == 1){ (isBefore)?(b_dt.setDate( b_dt.getDate()+1 )) : (b_dt.setDate( b_dt.getDate() -1 )); } // 당일포함 계산 (당일만 당일 포함됨...) 
	}else if( unit == 'W' ){
		isBefore?(b_dt.setDate( b_dt.getDate() - i_val*7 )) : (b_dt.setDate( b_dt.getDate() + i_val*7 ));
	}else if( unit == 'M' ){
		b_dt.setDate(1);
		isBefore?( b_dt.setMonth( b_dt.getMonth() - (i_val-1) ) ) : ( b_dt.setMonth( b_dt.getMonth() + (i_val+1) ) );
		b_dt.setDate( b_dt.getDate()-1 );	// lastday
		if(b_dt.getDate() >= b_d){ b_dt.setDate( b_d ); }
	}
	
	var setY = b_dt.getFullYear()+'';
	var setM = (b_dt.getMonth()+1)<10?('0'+(b_dt.getMonth()+1)):((b_dt.getMonth()+1)+'') ;
	var setD = b_dt.getDate()<10?'0'+b_dt.getDate():b_dt.getDate()+'';

    var v = setY+''+setM+''+setD;
    calSetVal(target_id, v);
}

/*******************************************************************************
 * 설명 : [calendar tag] : 날짜를 설정한다.	(validation 체크안함)
 * @param	f_id 	: calendar ID
 * @param val 	: 설정할 날짜(YYYYMMDD), null:(calendar value='')
 * @returns {없음}
 *******************************************************************************/
function calSetVal(f_id, val){
	var y,m,d;
	var isSel, isTxt, p_obj, fmt, txt;
	isSel = ($('#'+f_id+'Y').length > 0);
	isTxt = ($('#'+f_id+'_txt').length > 0);
	p_obj = eval('cld_param_'+f_id);
	fmt = (p_obj.format)?p_obj.format:'.';
	
	if( !!val ){
		if( isNaN(parseInt(val, 10)) || val.length!=8  ){ 
			//alert('ERR :: calSetVal :: 설정할 날짜가 YYYYMMDD형식이 아닙니다.'); 
			return; 
		}
		y = val.substring(0,4);
		m = val.substring(4,6);
		d = val.substring(6,8);
		txt = y +fmt+ m + fmt+ d;
	}else{
		y = '';
		m = '';
		d = '';
		txt = '';
	}
	
	if(isTxt){
		$('#'+f_id+'_txt').val( txt );
	}else if(isSel){
		if( !!val ){
			if( !$('#'+f_id+'Y').children().is('option[value='+y+']') ){
				//alert('ERR :: calSetVal :: 설정할 날짜['+ y+m+d +']가 범위에 없습니다.');
				$('#'+f_id+'Y')[0].focus();
				return; 
			}
			$('#'+f_id+'Y').val( y );
			$('#'+f_id+'M').val( m );
			setCalDaySelbox(f_id);
			$('#'+f_id+'D').val( d );
		}else{
			$('#'+f_id+'Y').val( '' );
			$('#'+f_id+'M').val( '' );
			$('#'+f_id+'D').val( '' );
		}
	}
	
	if(p_obj.valFormat == '1'){
		$('#'+f_id).val( txt );
	}else{
		$('#'+f_id).val( y +''+ m +''+ d );
	}
}

/*******************************************************************************
 * 설명 : [calendar tag] : 달력버튼 binding 관련
 * @param	o 		: 달력버튼
 * @param	f_id 	: calendar ID
 *******************************************************************************/
function calBindPicker(o, f_id){
	var p_obj = eval( 'cld_param_'+f_id );
	p_obj.val = $('#'+f_id).val();
	
	l = $('#'+p_obj.offset).offset().left;
	t = $('#'+p_obj.offset).offset().top+parseInt(p_obj.cal_top, 10);
	$.ajax({
		url	: p_obj.url_picker,
		type : 'post',
		data : p_obj,
		dataType : 'html',
		success : function(data) {
			$('div[id^=calendar_div_]').remove();
			var lp = $(o).parents('.pop-wrap:first');
			var layerOriHeight =0;
			var isResizesLayer = false;
			if( lp.length > 0 ){		// layer popup
				l = l - $('.pop-content', lp).offset().left;
				t = t - $('.pop-content', lp).offset().top + $('.pop-content', lp).scrollTop();
				$('<div id="calendar_div_'+f_id+'"></div>').css({ position : 'absolute', left: l, top : t, cursor : 'pointer', display : 'none' }).html(data).appendTo( $('.pop-wrap > .pop-content') ).show();
				// resize layer popup
				layerOriHeight = parseInt($('.ly-body',lp).css('height'), 10);
				$('.ly-body',lp).data('oriHeight', layerOriHeight );
				var layerFullHeight = parseInt($('.pop-content',lp).css('height'), 10);
				if( layerFullHeight < t+300){
					isResizesLayer = true;
					$('.ly-body',lp).css({height : (layerOriHeight+t+300-layerFullHeight)}).wbUI('repositionPopup');
				}
			}else{
				$('<div id="calendar_div_'+f_id+'"></div>').css({ position : 'absolute', left : l, top : t, cursor : 'pointer', display : 'none' }).css('z-index',100).html(data).appendTo( 'body' ).show();
			}
			$(o).parents().each(function(n,v){ z=parseInt($(v).css('z-index'),10); if(z>99){ $('#calendar_div_'+f_id).css('z-index', z+1); return false;}  });
			$('#calendar_picker_selbox_y').focus();
			if(lp.length == 0){
				$(document).bind('mousedown.cal', function(e){
					b = $(e.srcElement || e.target).parents().is( $('#calendar_div_'+f_id) );
					if( !b ){
						$('#calendar_div_'+f_id).remove();
						if( isResizesLayer ){ $('.ly-body',lp).css({height : layerOriHeight}).wbUI('repositionPopup'); }
						$(document).unbind('mousedown.cal');
					}
				});
			}
		}
	});
	return false;
}

/*******************************************************************************
 * 설명 : 달력버튼 binding 관련
 * 		- WEBEDI xsl 파일에서 사용.
 * @param	o 			: 달력버튼 - this
 * @param	o_target 	: INPUT object
 * @param	o_params: 달력관련 파라미터 object
 *******************************************************************************/
function calBindPicker_NoTag(o, o_target, o_params){
	var p_obj = o_params;
	var f_id = $(o_target).attr('id');
	
	// param setting
	p_obj.isNoTag = true;	// TAG 아님 구분자
	p_obj.id = f_id;				// input id
	p_obj.cal_top = 27;
	if(!p_obj.url_picker){
		p_obj.url_picker = '/biz/Dream?withyou=CMCOM0065';	// /com/common/calendar.jsp
	}
	
	// binding
	l = $(o_target).offset().left;
	t = $(o_target).offset().top+parseInt(p_obj.cal_top, 10);
	$.ajax({
		url	: p_obj.url_picker,
		type : 'post',
		data : p_obj,
		dataType : 'html',
		success : function(data) {
			$('div[id^=calendar_div_]').remove();
			var lp = $(o).parents('.pop-wrap:first');
			var layerOriHeight =0;
			var isResizesLayer = false;
			if( lp.length > 0 ){		// layer popup
				l = l - $('.pop-content', lp).offset().left;
				t = t - $('.pop-content', lp).offset().top + $('.pop-content', lp).scrollTop();
				$('<div id="calendar_div_'+f_id+'"></div>').css({ position : 'absolute', left: l, top : t, cursor : 'pointer', display : 'none' }).html(data).appendTo( $('.pop-wrap > .pop-content') ).show();
				// resize layer popup
				layerOriHeight = parseInt($('.ly-body',lp).css('height'), 10);
				$('.ly-body',lp).data('oriHeight', layerOriHeight );
				var layerFullHeight = parseInt($('.pop-content',lp).css('height'), 10);
				if( layerFullHeight < t+300){
					isResizesLayer = true;
					$('.ly-body',lp).css({height : (layerOriHeight+t+300-layerFullHeight)}).wbUI('repositionPopup');
				}
			}else{
				$('<div id="calendar_div_'+f_id+'"></div>').css({ position : 'absolute', left : l, top : t, cursor : 'pointer', display : 'none' }).css('z-index',100).html(data).appendTo( 'body' ).show();
			}
			$(o).parents().each(function(n,v){ z=parseInt($(v).css('z-index'),10); if(z>99){ $('#calendar_div_'+f_id).css('z-index', z+1); return false;}  });
			$('#calendar_picker_selbox_y').focus();
			if(lp.length == 0){
				$(document).bind('mousedown.cal', function(e){
					b = $(e.srcElement || e.target).parents().is( $('#calendar_div_'+f_id) );
					if( !b ){
						$('#calendar_div_'+f_id).remove();
						if( isResizesLayer ){ $('.ly-body',lp).css({height : layerOriHeight}).wbUI('repositionPopup'); }
						$(document).unbind('mousedown.cal');
					}
				});
			}
		}
	});
	return false;
}