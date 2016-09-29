$(function() {
	"use strict"
	
	/**
		page functions for client side processing
	*/
	$.page = {
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
			document.cookie = "role=" + role;
			
			//temporary redirect to main page
			window.location = "main.html";
		}
	}
	
	$(document).ready(function(e) {
        $(".form-login").submit(function(e) {
			e.preventDefault();
			$.page.attempt_login($(this));
        });
    });
});