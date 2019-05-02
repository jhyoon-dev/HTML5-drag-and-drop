var con_w = 1000; // 콘텐츠의 기준 가로 사이즈 (scale 조절에 쓰임)
var con_h = 660; // 콘텐츠의 기준 세로 사이즈 (scale 조절에 쓰임)
var con_scale = 1; // 콘텐츠의 scale

var CHANCE__ = 1; // 기회 상수
var chance = CHANCE__; // 기회
var drag_value = [2,3,1,4]; // 정답 빈칸
var drop_value = [1,2,3,4]; // 빈칸에 번호 부여
var mouse_x; // 마우스 x 좌표
var mouse_y; // 마우스 y 좌표

var $btnCheck; // 확인 버튼
var $btnRetry; // 재시도 버튼

var $drops; // 빈칸들
var $drags; // 드래그 요소들


$(document).ready(function(){
	$(window).resize(function(){
		response();
	});
	$(window).resize();

	loadSuccess();
});

function loadSuccess(){
	$btnCheck = $('.btnCheck');
	$btnRetry = $('.btnRetry');
	$drops = $('.drop_obj');
	$drags = $('.drag_obj');

	$('#btn_replay, .btnRetry').click(function(){
		drag_quiz_reset();
	});

	$('#content')[0].onmouseup = mouseUpdate;

	$btnCheck.click(function(){
		drag_ansChk();
	});

	$drops.each(function(idx){
		var $this = $(this);
		$this.attr('data-answer', drop_value[idx]).attr('data-hasItem', '');
	});

	$drags.each(function(idx){
		var $drag = $(this);
		var drag_id = '#' + $drag.attr('id');
		$drag.attr('data-top', $drag.css('top'));
		$drag.attr('data-left', $drag.css('left'));
		$drag.attr('data-answer', drag_value[idx]);
		$drag.attr('data-saveAnswer', $drag.attr('data-answer'));
		$drag.draggable({
			start : function(){
				$drag.css('z-index', '11');
			},
			drag : function(event, ui){
				ui.position = {
					top: ui.position.top / con_scale,
					left: ui.position.left / con_scale
				}
			},
			stop : function(){
				for(var i = 1; i <= $drops.length; i++){
					var $drop = $('#drop_obj' + i);
					var $drop_x = Math.floor(px_to_num($drop.css('left')) * con_scale);
					var $drop_y = Math.floor(px_to_num($drop.css('top')) * con_scale);
					var $drop_width = $drop.width();
					var $drop_height = $drop.height();

					$drag.css('z-index', '10');
					//console.log(i + ': ' + 'x마우스 : ' + mouse_x + '=>' + $drop_x + '~' + ($drop_x+$drop_width) + '     ' +'y마우스 : ' + mouse_y + '=>' + $drop_y + '~' + ($drop_y+$drop_height));
					if(mouse_x >= $drop_x && mouse_x <= ($drop_x + $drop_width) && mouse_y >= $drop_y && mouse_y <= ($drop_y + $drop_height) ){
						if($drop.attr('data-hasItem') != ''){ // 기존 오브젝트의 위치 초기화
							$($drop.attr('data-hasItem')).stop().animate({
								'top' : $($drop.attr('data-hasItem')).attr('data-top'),
								'left' : $($drop.attr('data-hasItem')).attr('data-left')
							}, 200);
						}
						for(var y = 1; y <= $drops.length; y++){ // 기존 오브젝트의 기록을 제거
							var $tmp = $('#drop_obj' + y);
							if($tmp.attr('data-hasItem') === drag_id){
								$tmp.attr('data-hasItem', '');
								break;
							}
						}
						$drag.stop().animate({ // 새로운 오브젝트 배치
							'top' : $drop.css('top'),
							'left' : $drop.css('left')
						}, 200);
						$drop.attr('data-hasItem', drag_id); // 새로운 오브젝트 기록
						isFill();
						return;
					}
				}
				for(var i = 1; i <= $drops.length; i++){ // 위치 초기화되는 오브젝
					var $drop = $('#drop_obj' + i);
					if($drop.attr('data-hasItem') === drag_id){
						$drop.attr('data-hasItem', '');
						break;
					}
				}
				$drag.stop().animate({ // 드래그오브젝트를 아무런 드랍오브젝트에 닿지 않았을 때 위치 초기화
					'top' : $drag.attr('data-top'),
					'left' : $drag.attr('data-left')
				}, 200);
				$btnCheck.fadeOut(200);
			}
		});
	});
}

function isFill(){
	for(var i = 1; i <= $drops.length; i++){ // 기존 오브젝트의 기록을 제거
		var $tmp = $('#drop_obj' + i);
		if($tmp.attr('data-hasItem') === ''){
			$btnCheck.fadeOut(200);
			return;
		}
	}
	$btnCheck.fadeIn(200);
}

// 마우스 좌표
function mouseUpdate(event){
	mouse_x = event.pageX - ($(window).width() - $('#content').width())/2;
	mouse_y = event.pageY - ($(window).height() - $('#content').height())/2;
}

// 창 사이즈 조절 시 실행
function response(){
	var win_w = $(window).width();
	var win_h = $(window).height();
	if(win_w < con_w){
		con_scale = win_w/con_w;
	}else{
		con_scale = 1;
	}
	$('#content_wrap').css('transform', 'scale(' + con_scale + ')');
}

// 드래그 퀴즈 정답확인 함수
function drag_ansChk(){
	for(var i = 1; i <= $drops.length; i++){
		var $drop = $('#drop_obj' + i);
		if($drop.attr('data-hasItem') === ''){
			console.log('문제를 푸시오;');
			return;
		}
	}
	for(var i = 1; i <= $drops.length; i++){
		var $drop = $('#drop_obj' + i);
		var $drag = $($drop.attr('data-hasItem'));

		if(chance > 0 && $drop.attr('data-answer') != $drag.attr('data-answer')){
			chance--;
			call_alert('re');
			return;
		}else if(chance === 0){
			call_alert('wrong');
			$btnCheck.hide();
			$btnRetry.show();
			drag_marking()
			return;
		}
	}
	call_alert('correct');
	$btnCheck.hide();
	$btnRetry.show();
	drag_marking();
}

// 드래그 퀴즈 채점
function drag_marking(){
	$drags.draggable('disable');
	$('#next_bubble').fadeIn();
	for(var i = 1; i <= $drops.length; i++){
		var $drop = $('#drop_obj' + i);
		var $drag = $($drop.attr('data-hasItem'));

		if($drop.attr('data-answer') === $drag.attr('data-answer')){
			$drag.addClass('correct');
			$drop.find('.drag_result').css('background', 'url(./images/drag_o.png)');
		}else{
			$drag.addClass('wrong');
			$drop.find('.drag_result').css('background', 'url(./images/drag_x.png)');
		}
	}
}

// 드래그 퀴즈 초기화
function drag_quiz_reset(){
	chance = CHANCE__;
	$btnRetry.hide();
	$('.drag_result').css('background', 'none');
	$drops.each(function(idx){
		var $drop = $(this);
		$drop.attr('data-hasItem', '');
	});
	$drags.each(function(){
		var $drag = $(this);
		$drag.stop().animate({
			'top' : $drag.attr('data-top'),
			'left' : $drag.attr('data-left')
		}, 200);
		$drag.removeClass('wrong').removeClass('correct');
		$drag.draggable('enable');
	});
}

// px 문자열 삽입
function num_to_px(num){
	return num + 'px';
}

// % 문자열 삽입
function num_to_percent(num){
	return num + '%';
}

// px 삭제하고 숫자로 변환
function px_to_num(px){
	return Number(px.toString().replace('px',''));
}

// 정답, 오답, 다시풀기 팝업창 출력
function call_alert(str){
	$('#content').append('<div id="alert_wrap"></div>');
	if(str === 'correct'){
		$('#alert_wrap').append('<div id="alert_correct" class="alert_content"></div>');
	}else if(str === 'wrong'){
		$('#alert_wrap').append('<div id="alert_wrong" class="alert_content"></div>');
	}else if(str === 're'){
		$('#alert_wrap').append('<div id="alert_re" class="alert_content"></div>');
	}
	$('#alert_wrap').fadeIn(200);
	setTimeout(function(){
		$('#alert_wrap').fadeOut(200, function(){
			$('#alert_wrap').detach();
		});
	}, 1000);
}