$(function() {
	"use strict"
	
	/**
		page functions for client side processing
	*/
	$.page = {
		init : function() {
			Cookies.remove("groups");
			Cookies.remove("skin_color");
			
			$(".form-login").submit(function(e) {
				e.preventDefault();
				$.page.attempt_login($(this));
			});
			
			$("#loader").modal({
				backdrop : "static",
				keyboard : false,
				show : false	
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
			// Show loader animation
			$("#loader").modal("show");
			
			var data = $(form).serializeArray().reduce(function(obj, item) {
				obj[item.name] = item.value;
    			return obj;
			}, {});
			
			data = JSON.stringify(data);
			
			$.backend.attempt_login(data, function(response) {
				// success callback function
				
				$.page.set_cookie("groups", response.groups, 1);
				
				
				$.backend.CMS_Status.retrieve(function(active) {
					//success callback function
					if (active) {
						Cookies.set("skin_color", "skin-2");
					}else {
						Cookies.set("skin_color", "skin-1");	
					}
				}, function(){
					//complete callback function
					
					// redirect after successful login
					window.location = "main.html";	
				});
			}, function(responseText) {
				// error callback function
				$("#loader").modal("hide");
				
				alert(responseText);
				
				$("#password").val("");
				$("#password").focus();
			});
		}
	};
	
	/**
		functions for backend operations
	*/
	$.backend = {
		root_url : "https://crisismanagement.herokuapp.com/",
		attempt_login : function(data, successCallback, errorCallback) {
			//TODO: ajax calls to backend server for login
			$.ajax({
				url : $.backend.root_url + "login/",
				data : data,
				method : "POST",
				dataType : "json",
				success : function(data, textStatus, jqXHR) {
					if (data.success) {
						if(successCallback !== undefined) {
							successCallback.call(this, data);
						}
					}
				},
				error : function(jqXHR, textStatus, errorThrown ) {
					if(errorCallback !== undefined) {
						errorCallback.call(this, jqXHR.responseText);
					}
				}
			});
		}, // end $.backend.attempt_login
		CMS_Status : {
			retrieve : function(successCallback, completeCallback) {
				$.ajax({
					url : $.backend.root_url + "CMSStatus/read/1/",
					method : "GET",
					dataType : "json",
					success : function(data, textStatus, jqXHR) {
						if(successCallback !== undefined) {
							if (data.success) {
								successCallback.call(this, data.active);
							}
						}
					},
					complete: function(jqXHR, textStatus) {
						if(completeCallback !== undefined) {
							completeCallback.call(this);
						}
					}
				});
			} // end $.backend.CMS_Status.retrieve
		} // end $.backend.CMS_Status
	} // end $.backend
	
	$(document).ready(function(e) {
		$.page.init();
    });
});