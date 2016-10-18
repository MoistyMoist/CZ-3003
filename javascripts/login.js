$(function() {
	"use strict"
	
	/**
		page functions for client side processing
	*/
	$.page = {
		init : function() {
			Cookies.remove("groups");
			Cookies.set("skin_color", "skin-1");
			
			$(".form-login").submit(function(e) {
				e.preventDefault();
				$.page.attempt_login($(this));
			});
		},
		set_cookie : function(c_name, value, exdays) {
			/*var exdate = new Date();
			exdate.setDate(exdate.getDate() + exdays);
			var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
			document.cookie = c_name + "=" + c_value;*/
			Cookies.set(c_name, value, {expires: exdays});
		},
		attempt_login : function(form) {
			var data = $(form).serializeArray().reduce(function(obj, item) {
				obj[item.name] = item.value;
    			return obj;
			}, {});
			
			data = JSON.stringify(data);
			$.backend.attempt_login(data);
		}
	};
	
	/**
		functions for backend operations
	*/
	$.backend = {
		root_url : "https://crisismanagement.herokuapp.com/",
		attempt_login : function(data) {
			//TODO: ajax calls to backend server for login
			$.ajax({
				url : $.backend.root_url + "login/",
				data : data,
				method : "POST",
				dataType : "json",
				success : function(data, textStatus, jqXHR) {
					//alert(data);
					if (data.success) {
						$.page.set_cookie("groups", data.groups, 1);
						// redirect after successful login
						window.location = "main.html";
					}
				},
				error : function(jqXHR, textStatus, errorThrown ) {
					alert(jqXHR.responseText);
					
					$("#password").val("");
					$("#password").focus();
				}
			});
			
		}
	}
	
	$(document).ready(function(e) {
		$.page.init();
    });
});