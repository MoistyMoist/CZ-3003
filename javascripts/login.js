$(function() {
	"use strict"
	
	/**
		page functions for client side processing
	*/
	$.page = {
		init : function() {
			//Cookies.remove("role");
			//$.page.set_cookie("role", "", 1);
		},
		set_cookie : function(c_name, value, exdays) {
			/*var exdate = new Date();
			exdate.setDate(exdate.getDate() + exdays);
			var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
			document.cookie = c_name + "=" + c_value;*/
			Cookies.set(c_name, value, {expires: exdays});
		},
		attempt_login : function(form) {
			var data = $(form).serialize();
			$.backend.attempt_login(data);
		}
	};
	
	/**
		functions for backend operations
	*/
	$.backend = {
		
		attempt_login : function(data) {
			//TODO: ajax calls to backend server for login
			
			var role = $("#username").val();
			$.page.set_cookie("role", role, 1);
			
			//temporary redirect to main page
			window.location = "main.html";
		}
	}
	
	$(document).ready(function(e) {
		$.page.init();
        $(".form-login").submit(function(e) {
			e.preventDefault();
			$.page.attempt_login($(this));
        });
    });
});