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
			
			$.backend.attempt_login(data).then(function(response) {
				$.page.set_cookie("groups", response.groups, 1);
				$.backend.CMS_Status.retrieve().then(function(active) {
					if (active) {
						Cookies.set("skin_color", "skin-2");
					} else {
						Cookies.set("skin_color", "skin-1");	
					}
				}).then(function() {
					// redirect after successful login
					window.location = "main.html";
				});
			}).catch(function(error) {
				$("#loader").modal("hide");
				
				alert(error);
				
				$("#password").val("");
				$("#password").focus();
			});
		}
	};
	
	/**
		functions for backend operations
	*/
	$.backend = {
		//root_url : "https://crisismanagement.herokuapp.com/",
		get_root_url : function() {
			if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
				return "https://crisismanagement.herokuapp.com/";	
			}
			
			return "/";
		},
		attempt_login : function(data) {
			var promise = new Promise(function(resolve, reject) {
				$.ajax({
					url : $.backend.get_root_url() + "login/",
					data : data,
					method : "POST",
					dataType : "json",
					success : function(data, textStatus, jqXHR) {
						if (data.success) {
							resolve(data);
						} else {
							reject("Login Failed.");	
						}
					},
					error : function(jqXHR, textStatus, errorThrown) {
						reject(jqXHR.responseText);
					}
				});
			});
			return promise;
		}, // end $.backend.attempt_login
		CMS_Status : {
			retrieve : function() {
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "CMSStatus/read/1/",
						method : "GET",
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data.active);
							} else {
								reject("CMS Status retrieve failed");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			} // end $.backend.CMS_Status.retrieve
		} // end $.backend.CMS_Status
	} // end $.backend
	
	$(document).ready(function(e) {
		$.page.init();
    });
});