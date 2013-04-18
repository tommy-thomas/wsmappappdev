/*function customSetup() {
	$.get("communities.strings",function(data){
			var communitiesArray = data.split("\n");
			var commTable = new Array();
					for (i in communitiesArray) {
						var commName = communitiesArray[i];
						commTable[i] = '<tr><td class="commLink">' + commName + '</td><td width="10"><i class="icon-chevron-right grey"></i></td></tr>'
					}
					$("#commTable").html(commTable.join(''));
					$("#commTable tr").click(function(){
						$("#login .loading").show();
						$("#loginmsg").text("");
						
						username=$("#login input[name='username']").val();
						var passwd=$("#login input[name='passwd']").val();
						community = $(this).find(".commLink").text();
						//alert(community);
						$.ajax({
							type: 'POST',
							url: "http://www.southsidehealth.org/hhapp/server-2012.php",
							//cache: false,
							data: {"op":"login","username":username, "passwd":passwd, "community":community},
							success: function(data){
								if(typeof(data)=="string"){
									// is an error
									alert(data);
									$("#login .loading").hide();
									$("#loginmsg").text(data);
									return;
								}
								
								buildings=data[0];
								cases=data[1];
								totalCases=0;
								for(i in cases){ ++totalCases;}
								// data loaded ... populate display
								streetSetup();
								$("#login .loading").hide();
								$("#login").hide();
								$(".showWhenLoggedIn").show();
								// begin GPS collection
								GPSTrackingBegin();
								populateDisplay();
							},
							dataType: "json"
						});
						
					});
					
		});
}*/
