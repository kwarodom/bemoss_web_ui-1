/**

Copyright (c) 2016, Virginia Tech
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the authors and should not be
interpreted as representing official policies, either expressed or implied, of the FreeBSD Project.

This material was prepared as an account of work sponsored by an agency of the United States Government. Neither the
United States Government nor the United States Department of Energy, nor Virginia Tech, nor any of their employees,
nor any jurisdiction or organization that has cooperated in the development of these materials, makes any warranty,
express or implied, or assumes any legal liability or responsibility for the accuracy, completeness, or usefulness or
any information, apparatus, product, software, or process disclosed, or represents that its use would not infringe
privately owned rights.

Reference herein to any specific commercial product, process, or service by trade name, trademark, manufacturer, or
otherwise does not necessarily constitute or imply its endorsement, recommendation, favoring by the United States
Government or any agency thereof, or Virginia Tech - Advanced Research Institute. The views and opinions of authors
expressed herein do not necessarily state or reflect those of the United States Government or any agency thereof.

VIRGINIA TECH – ADVANCED RESEARCH INSTITUTE
under Contract DE-EE0006352

#__author__ = "BEMOSS Team"
#__credits__ = ""
#__version__ = "2.0"
#__maintainer__ = "BEMOSS Team"
#__email__ = "aribemoss@gmail.com"
#__website__ = "www.bemoss.org"
#__created__ = "2014-09-12 12:04:50"
#__lastUpdated__ = "2016-03-14 11:23:33"

**/

var _values_on_submit_lighting = {};

//Modify status	 when clicked
$( "#light_on" ).click(function() {
	if ($("#light_on").css('background-color') == "green") {
	} else {
		$(this).css('background-color','green');
		$("#light_off").css('background-color','rgba(222, 222, 222, 0.55)');
		status = 'ON';
        $('#brightness').slider('value', '100');
        $('#brightness').slider('enable');
        $('#brightness_value').val('100%');
	}
});

$( "#light_off" ).click(function() {
	if ($("#light_off").css('background-color') == "green") {
	} else {
		$(this).css('background-color','green');
		$("#light_on").css('background-color','rgba(222, 222, 222, 0.55)');
		status = 'OFF';
        $('#brightness').slider('value', '0');
        $('#brightness').slider('disable');
        $('#brightness_value').val('0%');
	}
});
$(function() {

    $("#brightness").slider({
        value: brightness,
        orientation: "horizontal",
        range: "min",
        animate: true,
        min: 0,
        max: 100,
        slide: function (event, ui) {
            $("#brightness_value").val(ui.value + "%");
        }
    });


    $("#brightness_value").val($("#brightness").slider("value") + "%");
    $(".slider").slider("float");


    if (_type == '2WL') {
        $('#brightness').slider("disable");
        $("#brightness_value").val('');
        $('#dim_container').css('background-color', 'rgba(255, 255, 255, 0.4)');
    }


    if (_type == '2HUE') {
        $('#color_container').show();
        if (role != 'tenant') {
            $('.color-box').colpick({
                colorScheme:'dark',
                layout:'rgbhex',
                color:color,
                submit:0,
                onChange:function(hsb,hex,rgb,el) {
                    $(el).css('background-color', 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
                }
            })
            .css('background-color', color);
        } else {
            $('#color_container').css('background-color', color);
        }
    } else {
        $('#color_container').css('background-color','rgba(255, 255, 255, 0.4)');
    }

     if (role == 'tenant') {
         $('#brightness').slider("disable");

    }
});

$( document ).ready(function() {
$.csrftoken();


    console.log("ws://" + window.location.host + "/socket_lighting");
    var ws = new WebSocket("ws://" + window.location.host + "/socket_lighting");
    console.log("websocket connection established");
     ws.onopen = function () {
         ws.send("WS opened from html page");
     };

     ws.onmessage = function (event) {
         var _data = event.data;
         _data = $.parseJSON(_data);
         var topic = _data['topic'];
         // ["", "agent", "ui", device_type, command, building_name, zone_id, agent_id]
         if (topic) {
             topic = topic.split('/');
             console.log(topic);
             if (topic[7] == device_id && topic[4] == 'device_status_response') {
                 if ($.type( _data['message'] ) === "string"){
                     var _message = $.parseJSON(_data['message']);
                     if ($.type(_message) != "object"){
                         _message = $.parseJSON(_message)
                     }
                     change_lighting_values(_message);
                 } else if ($.type( _data['message'] ) === "object"){
                     change_lighting_values(_data['message']);
                 }

             }
             if (topic[7] == device_id && topic[4] == 'update_response') {
                  var message_upd = _data['message'];
                 var popup = false
                 if ($.type( _data['message'] ) === "string"){
                    if (message_upd.indexOf('success') > -1) {
                        popup = true
                        }
                 } else if ($.type( _data['message'] ) === "object") {
                    if (message_upd['message'].indexOf('success') > -1){
                        popup = true
                        }
                 }

                 if (popup) {
                     change_lighting_values(_values_on_submit_lighting);
                     $('.bottom-right').notify({
                        message: { text: 'The changes made at '+update_time+" are now updated in the device!"},
                        type: 'blackgloss',

                         fadeOut: { enabled: true, delay: 5000 }
                      }).show();
                 }
             }
         }
     };


    function change_lighting_values(data) {
        if (data.status == 'ON') {
            $("#light_on").css('background-color', 'green');
            $("#light_off").css('background-color', 'rgba(222, 222, 222, 0.55)');
            if (data.brightness) {
                if ($("#brightness").slider("option", "disabled", true) && (role != 'tenant')) {
                    $('#brightness').slider('enable');
                }
            }
            status = 'ON';
		} else {
			$("#light_off").css('background-color','green');
			$("#light_on").css('background-color','rgba(222, 222, 222, 0.55)');
            status = 'OFF';
            $('#brightness').slider('disable');
		}

        if (data.brightness) {
            $('#brightness').slider({ value: data.brightness });
            $("#brightness_value").val(data.brightness + "%");
        }


        if (data.color && _type == '2HUE') {
            var _color = data.color;
            _color = _color.toString(); //should be in hex #rrggbb format
            $('.color-box').colpick({ color: _color });
            $('.color-box').css('background-color', _color);
        }
    }

$( "#submit_lighting_data" ).click(function(evt) {
	evt.preventDefault();
	update_time = new Date();
	update_time = update_time.toLocaleTimeString();
	//alert(update_time);
	var status;
	if ($("#light_off").css('background-color') == "green" || $("#light_off").css('background-color') == "rgb(0, 128, 0)")
		status = 'OFF';
	else if ($("#light_on").css('background-color') == "green" || $("#light_on").css('background-color') == "rgb(0, 128, 0)")
		status = 'ON';


    if (_type == '2WL') {
        var values = {
		    "status": status,
		    "device_info":device_info
		    };
    } else if (_type == '2WSL') {
        var values = {
		    "brightness": parseFloat($( "#brightness_value" ).val().replace("%","")),
		    "status": status,
		    "device_info":device_info
		    };
    } else if (_type == '2HUE') {
        var lt_color = $('.color-box').css('background-color').toString();
        lt_color = lt_color.replace('rgb','');
        if (lt_color.indexOf('a(') > -1) {
            lt_color = '(255,255,255)';
        }
        var values = {
		    "brightness": parseFloat($( "#brightness_value" ).val().replace("%","")),
		    "color": lt_color,
		    "status": status,
		    //"saturation": parseFloat($( "#saturation_value" ).val().replace("%","")),
		    "device_info":device_info
		    };
    }
    _values_on_submit_lighting = values;
    submit_lighting_data(values);

});


function submit_lighting_data(values) {
    var jsonText = JSON.stringify(values);
    console.log(jsonText);
	$.ajax({
		  url : '/update_light/',
		  type: 'POST',
		  data: jsonText,
		  dataType: 'json',
		  success : function(data) {
			//lighting_data_updated();
		  	/*$('.bottom-right').notify({
		  	    message: { text: 'Your settings will be updated shortly' },
		  	    type: 'blackgloss'
		  	  }).show();*/
		  },
		  error: function(data) {
              submit_lighting_data(values);
			  $('.bottom-right').notify({
			  	    message: { text: 'Something went wrong when submitting the data. Please try again.' },
			  	    type: 'blackgloss',
                  fadeOut: { enabled: true, delay: 5000 }
			  	}).show();
		  }
		 });
}

});