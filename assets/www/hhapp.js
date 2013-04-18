var version='3.1', blank={"Mode": "", "OrgName": "", "OrgType": "", "OrgTypeCombined": "", "OrgTypeOther": "", "Addnum": "", "Fraction": "", "Street": "", "Unit": "", "city": "Chicago", "state": "IL", "Phone": "", "Email": "", "URL": "", "Leader": "", "Private": "", "post_it": "", "Notes": "", "Disposition": "", "DKOpen": "", "DKName": "", "DKAddress": "", "DKType": ""},buildings=null, cases=null, username=null, community=null, cs=null, cb=null, totalCases=0, $editForm=null, pendingUpdates=0, inProg=[], db=window.localStorage, watchID = null, gpsFlushID=null, AppDB = 0, GPSTracker=[], debug=false;
var username="";
var community="";
var currscreen;
var multi=0;
var fromEdit=0;
var street="";
var block="";
var cs;
var cb;
var multiaddr="";
var prevscreen="";
var prevtitle="";
var prevscr="";

document.title+=" " +version;
$(document).ready(function(){
	commSetup();
	setupValidation();
	$.templates({
		'mainlistEntry': "<tr class='{{:eo}}' id='i{{:id}}'><td><a class='btn btn-success btn-small'><i class='icon-camera icon-white {{:cameraStatus}}'></i></a></td><td class='addr'>{{:i}}</td><td>{{:OrgName}}</td><td class='d'>{{:Disposition}}</td><td><i class='icon-chevron-right grey'></i></td></tr>",
		'mainlistEntryMULTI': "<tr class='multi {{:eo}}' bgcolor='#eed'><td></td><td class='addr'>{{:i}}</td><td><em>Multiple ({{:count}} units)</em></td><td></td><td><i class='icon-chevron-right grey'></i></td></tr>",
		'multilistEntry': "<tr id='i{{:id}}' class='unit'><td><a class='btn btn-success btn-small'><i class='icon-camera icon-white {{:cameraStatus}}'></i></a></td><td>{{:Unit}}</td><td>{{:OrgName}}</td><td class='d'>{{:Disposition}}</td><td><i class='grey icon-chevron-right'></i></td></tr>"
	});
	procForm("#frmEdit");

	// Wire buttons
	wireButtons();
	// form setup
	newForm={
		open: function(){
			var f=$("#frmNew form");
			f[0].reset();
			$(".section").hide();
			$("[name='Street']",f).val(cs);
			$("[name='Addnum']",f).val(cb);
			$("input[name='OrgType']").val(0);
			$("input[name='OrgTypeCombined']").val("0.00");
			$(".OrgType").html("<span style='color:#9f9f9f'> Type</span>");
			$(".OrgTypeCombined").html("<span style='color:#9f9f9f'> Subtype</span>");
			$("#OrgTypeOther").hide();
			$("#frmNew").show();
			$("#self-rightbutton").hide();
			$("#createButton").show();
			setupValidation();
			$(".dispUntched").trigger("click");
			$("#frmNew form").attr("data","unchanged");
			$("#frmNew input").change(function(){
				$("#frmNew form").attr("data","changed");
			});
			
		},
		buttons: {
			"Create": function(){
				
				$("body").trigger("updatePending", 1);
				//var frmdata=$("#frmNew form").serialize();
				var frmdata=$.extend({},blank,$("#frmNew form").serializeObject());
				if (recordStatus(frmdata)) frmdata = $.param(recordStatus(frmdata));
				else {
					alert("Please select a status other than 'Not Visited'");
					return;
				}
				if ($("input[name='Street']",$("#frmNew")).val()=="") {
					console.log("ST NAME:"+$("input[name='Street']").val());
					alert("Please enter a valid street name.");
					return;
				}
				
				if ($("input[name='Phone']",$("#frmNew")).parent().hasClass("error")) {
					alert("Please enter a valid phone number, or leave it blank.");
					return;
				}
				if ($("input[name='Email']",$("#frmNew")).parent().hasClass("error")) {
					alert("Please enter a valid email address, or leave it blank.");
					return;
				}
				$("#createButton").addClass("disabled");
				$("#createButton").attr("disabled","disabled");
				goBack(1);
				$.ajax({
					type: 'POST',
					url: "http://www.southsidehealth.org/hhapp/server.php?op=create",
					xhrFields: {
					      withCredentials: true
					   },
					data: frmdata,
					success: function(data){
						var caseid="" + data['CaseID'];
						cases[caseid]=data;
						var c=data;

						var ns=c['Street'];
						var na=c['Addnum'];
						var nb=Math.floor(na/100)*100;
						$("body").trigger("updatePending", -1);

						$("#header").find(".total").text("(" + ++totalCases + " total cases)");
						if(buildings[ns]){
							if(buildings[ns][nb]){
								if(buildings[ns][nb][na]){
									var items=buildings[ns][nb][na];
									if(typeof(items)!="string"){
										buildings[ns][nb][na].push(caseid);
									}else{
										buildings[ns][nb][na]=[items,caseid];
									}
									// if multi rendered ...

									// MAKE MULTI
									//
									// FINISH THIS
									/*var o=$("#s-"+ns.replace(/ /g,"_")+"-"+na);
									if(o.length){
										//o.append("<tr id='i" + caseid + "' class='unit'><td>"+c['Unit']+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>" + cameraStatus[caseid] + "</td></tr>");
										o.append($.render['multilistEntry']({id:caseid, Unit:c['Unit'], OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(caseid)}));
										
									}*/
									// we just made a new multi ... on mainlist
									var m=buildings[ns][nb][na];

									/*var o=$("#m-"+ns.replace(/ /g,"_")+"-"+nb);
									if(o.length){
										var eo=parseInt(na)%2?"eoo":"eoe";
										// remove old and replace
										var row=o.find("tr").find("td:eq(0):contains(" + na +")").parent();
										//row.replaceWith($("<tr class='multi " + eo +"'><td>"+na+"</td><td><em>MULTIPLE (" +m.length + " units)</em></td><td></td><td></td></tr>"));
										row.replaceWith($.render['mainlistEntryMULTI']({eo:eo, i:na, count:m.length}));

									}*/

								}else{
									// new address on existing block
									buildings[ns][nb][na]=caseid;
									/*var o=$("#m-"+ns.replace(/ /g,"_")+"-"+nb);
									if(o.length){
										// already made the panel so just add as item
										var eo=parseInt(na)%2?"eoo":"eoe";
										o.append($.render['mainlistEntry']({eo:eo, id:caseid, i:na, OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(caseid)}));
										//o.append("<tr class='" + eo + "' id='i" + caseid + "'><td>"+na+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "<td></td>" + cameraStatus[caseid] + "</td></tr>");
										
									}*/
								}
							}else{
								//no such block but we do have a street
								buildings[ns][nb]={};
								buildings[ns][nb][na]=caseid;

								//if there is no such block, then the next time it is rendered, this will be added fine
								$("#blocknums").append($("<option>").text(nb));
							}

						}else{
							// no such street
							buildings[ns]={};
							buildings[ns][nb]={};
							buildings[ns][nb][na]=caseid;
							//need to remake the street
							$("#streets").append($("<option>").text(ns));
							// new street means no prior data, so nothing special to do
						}
						//renderAddr(ns,nb,na);
						
						
						updateTable()
						if (multi) multiTable(multiaddr);
						
						$("input").blur();
						$("#createButton").removeClass("disabled");
						$("#createButton").removeAttr("disabled");
					},
					error: function(xhr){
						console.log(xhr);
						alert("Error: Record failed to save. Logout and try again, or contact the survey lab if the problem persists.");
						$("#createButton").removeClass("disabled");
						$("#createButton").removeAttr("disabled");
					},
					dataType: "json"
				});
			}
		}
	};

	editForm={
		buttons: {
			"Save": function(){
				var caseid=$("#frmEdit input[name='CaseID']").val();
				console.log(caseid+" is pending");
				$("#i"+caseid+" .d").addClass("pending");
				$("body").trigger("updatePending", 1);
				// add to queue for recovery???
				//var frmdata=$("#frmEdit form").serialize();

				// clear DK fields if not Unsure Disposition
				if($("#frmEdit form [name='Disposition']").val()!="Unsure"){
					var f=["DKOpen", "DKName", "DKAddress", "DKType"];
					for(i in f){
						$("#frmEdit form [name='" +f[i] +"']").val([null]);
					}
				}
				//var frmdata=$.param($.extend({},blank,$("#frmEdit form").serializeObject()));
				var frmdata=$.extend({},blank,$("#frmEdit form").serializeObject());
				if (recordStatus(frmdata)) frmdata = $.param(recordStatus(frmdata));
				else {
					alert("Please select a status other than 'Not Visited'");
					return;
				}
				if ($("input[name='Street']",$("#frmEdit")).val()=="") {
					alert("Please enter a valid street name.");
					return;
				}
				if ($("input[name='Phone']",$("#frmEdit")).parent().hasClass("error")) {
					alert("Please enter a valid phone number, or leave it blank.");
					return;
				}
				if ($("input[name='Email']",$("#frmEdit")).parent().hasClass("error")) {
					alert("Please enter a valid email address, or leave it blank.");
					return;
				}
				$("#saveButton").addClass("disabled");
				$("#saveButton").attr("disabled","disabled");
				console.log(frmdata);
				//inProg["i"+caseid]=1;

				// if disp or orgname has changed, show italic mod
				var f=['Addnum','OrgName','Disposition'];
				for (i in f){
					if($("#frmEdit form [name='" +f[i] +"']").val()!=cases[caseid][f[i]]){
						$("#i"+caseid+" td:eq("+i+")").html("<i>"+$("#frmEdit form[name='"+f[i]+"']").val()+"</i>");
					}
				}

				goBack(1);
				$.ajax({
					type: 'POST',
					url: "http://www.southsidehealth.org/hhapp/server.php?op=save",
					xhrFields: {
					      //withCredentials: true
					   },
					data: frmdata,
					success: function(data){
						//console.log("begin server response data");
						//console.log(data);
						var caseid=""+data['CaseID'];
						var c=cases[caseid];
						cases[caseid] = data;
						$("body").trigger("updatePending", -1);
						//inProg["i"+caseid]=null;
						$("#i"+caseid+" .d").removeClass("pending");
						var ns=data['Street'];
						var na=data['Addnum'];
						var nb=Math.floor(na/100)*100;
						var os=c['Street'];
						var oa=c['Addnum'];
						var ob=Math.floor(oa/100)*100;
						//var oe=buildings[os][ob][oa];

						if(data['Street']!=c['Street'] || data['Addnum']!=c['Addnum']){
							console.log("street or address changed");
							// street or address changed
							// need to remap table
							//  NEED TO remove old from buildings db
							if(typeof(buildings[os][ob][oa])!="string"){
								console.log("is a unit in a multi");
								// is a unit
								// find and splice it out
								var position=buildings[os][ob][oa].indexOf(caseid);
								buildings[os][ob][oa].splice(position,1);

							}else{
								console.log("is a main entry");
								// is a singleton so remove entry.
								delete buildings[os][ob][oa];
							}
							//renderAddr(os,ob,oa);

							if(buildings[ns]){
								if(buildings[ns][nb]){
									if(buildings[ns][nb][na]){
										var items=buildings[ns][nb][na];
										if(typeof(items)!="string"){
											buildings[ns][nb][na].push(caseid);
										}else{
											buildings[ns][nb][na]=[items,caseid];
										}
										/*$("#i"+caseid).remove();
										c=cases[caseid]=data;
										var o=$("#s-"+ns.replace(/ /g,"_")+"-"+na);
										console.log(o);
										if(o.length){
											//o.append("<tr id='i" + caseid + "' class='unit'><td>"+c['Unit']+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>" + cameraStatus[caseid] + "</td></tr>");
											console.log("i don't know what this does");
											$.render['multilistEntry']({id: caseid, Unit: c['Unit'], OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(caseid)});
											
										}*/
										// we just made a new multi ... on mainlist
										var m=buildings[ns][nb][na];

										/*var o=$("#m-"+ns.replace(/ /g,"_")+"-"+nb);
										console.log(o);
										if(o.length){
											// TURNS A SINGLETON INTO A MULTI
											var eo=parseInt(na)%2?"eoo":"eoe";
											// remove old and replace
											var row=o.find("tr").find("td:eq(0):contains(" + na +")").parent();
											console.log(row);
											//row.replaceWith($("<tr class='multi " + eo +"'><td>"+na+"</td><td><em>MULTIPLE (" +m.length + " units)</em></td><td></td><td></td></tr>"));
											//row.replaceWith($.render['mainlistEntryMULTI']( {eo:eo, i:na , count:m.length}));
											row.replaceWith("<tr>i just became a multi</tr>");
										}*/
									}else{
										// new address on existing block
										//$("#i"+caseid).remove();
										buildings[ns][nb][na]=caseid;
										/*var o=$("#m-"+ns.replace(/ /g,"_")+"-"+nb);
										if(o.length){
											// already made the panel so just add as item
											var eo=parseInt(na)%2?"eoo":"eoe";
											var c=cases[caseid]=data;
											//o.append("<tr class='" + eo + "' id='i" + caseid + "'><td>"+na+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>"+cameraStatus[caseid] + "</td></tr>");
											//o.append($.render['mainlistEntry']({eo:eo, id:caseid, i:na, OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(caseid)}));
											o.append("<tr>updated addr of a main</tr>");
										}*/
									}
								}else{
									//no such block
									buildings[ns][nb]={};
									buildings[ns][nb][na]=caseid;
									//$("#i"+caseid).remove();
									//cases[caseid]=data;
									//if there is no such block, then the next time it is rendered, this will be added fine
									$("#blocknums").append($("<option>").text(nb));
								}
							}else{
								buildings[ns]={};
								buildings[ns][nb]={};
								buildings[ns][nb][na]=caseid;
								//need to remake the street
								//$("#i"+caseid).remove();
								$("#streets").append($("<option>").text(ns));
								// new street means no prior data, so nothing special to do
								//cases[caseid]=data;
							}

						}else{

							// we are done NO CHANGES TO ADDRESS, just update
							//c=cases[caseid]=data;
							//$("#i"+caseid).html("<td>"+($("#i"+caseid).hasClass("unit")?c['Unit']:c['Addnum'])+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>"+cameraStatus[caseid] + "</td>");
							/*if($("#i"+caseid).hasClass("unit")) {
								//$("#i"+caseid).replaceWith( $.render['multilistEntry']({id: caseid,Unit: c['Unit'], OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(caseid)}));
								$("#i"+caseid).replaceWith("<tr>updated in a multi</tr>");
							}
							else{
								//$("#i"+caseid).replaceWith( $.render['mainlistEntry']({eo:eo, id:caseid, i:c['Addnum'], OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(caseid)}));
								$("#i"+caseid).replaceWith("<tr>updated main entry w/same addr</tr>");
							}*/
						}
						//renderAddr(ns,nb,na);
						
						
						updateTable()
						if (multi) multiTable(multiaddr);
						
						
						$("input").blur();
						$("#saveButton").removeClass("disabled");
						$("#saveButton").removeAttr("disabled");
						
					},
					error: function(xhr, textStatus, errorThrown){
						//------------------------------------
						// ERROR CODE
						console.log(xhr);
						alert("Error: Record failed to save. Logout and try again, or contact the survey lab if the problem persists.");
						$("#saveButton").removeClass("disabled");
						$("#saveButton").removeAttr("disabled");
						//----------------------------------------
					},
					dataType: "json"
				});
			}
		}
	};

	// Deals with photo/gps data
	checkGPS(); 
	cameraUploadPrep();
	// Deals with pending updates
	$("body").on("updatePending",function(e,amt){ pendingUpdates+=amt;$("#pending").text(pendingUpdates?pendingUpdates:"");});
	// updateCheck
	updateCheck();
	// check on storage
	if(!db.getItem('pics')){
		db.setItem('pics','{}');
	}	
});

function androidBackButton() { 
    // EXPERIMENTAL
     goBack(0);
}

/*----------------------
// NAVIGATION FUNCTIONS
------------------------*/

// Back function
function goBack(save) {
	if ($("#frmEdit form").attr("data")=="unchanged") save=1;

	if (currscreen=="main") {
		// Go to block listing
		toBlocks();
	}
	else if (currscreen=="blocks") {
		// Go to street listing
		toStreets();
	}
	else if (currscreen=="streets") {
		// Go to community listing
		toCommunities();
	}
	else if (currscreen=="communities") {
		window.location.reload();
	}
	else if (currscreen=="multi") {
		toMain();
		multi=0;
	}
	else if (currscreen=="tax1") {
		toEdit2();
	}
	
	else if (currscreen=="tax2") {
		if (fromEdit) toEdit2();
		else toTax1();
	}
	
	
	else if ((currscreen=="new" || currscreen=="edit") && !multi) {
		var leave;
		if (save != 1) leave = confirm("The record has not been saved. Discard changes?");
		else leave = 1;
		if (leave) toMain();
	}
	else if ((currscreen=="new" || currscreen=="edit" ) && multi) {
		var leave;
		if (save != 1) leave = confirm("The record has not been saved. Discard changes?");
		else leave = 1;
		if (leave) {
			toMulti();
		}
	}
	else if (currscreen=="searchedit") {
		var leave;
		if (save != 1) leave = confirm("The record has not been saved. Discard changes?");
		else leave = 1;
		if (leave) {
			if (prevscreen=="blocks") toBlocks();
			if (prevscreen=="streets") toStreets();
			if (prevscreen=="main") toMain();
			if (prevscreen=="multi") {
				toMulti();
			}
		}
	}
	else console.log("currscreen is: " + currscreen + " and multi is: "+multi);
	$("body").css("background-color","#fff");
}

function toCommunities() {
	$("#frmEdit").hide();
	$("#frmNew").hide();
	$("#mainlist").hide();
	$("#multilist").hide();
	$("#strnav").hide();
	$("#self-rightbutton").show();
	$("#createButton").hide();
	$("#saveButton").hide();
	$("#streetSelectView").hide();
	$("#blockSelectView").hide();
	$("#communities").show();
	$("#login").show();
	$("#taxonomy1").hide();
	$("#taxonomy2").hide();
	currscreen = "communities";
	$("#self-title").text("Communities");
}
function toStreets() {
	streetSetup();
	$("#frmEdit").hide();
	$("#frmNew").hide();
	$("#mainlist").hide();
	$("#multilist").hide();
	$("#strnav").hide();
	$("#self-rightbutton").show();
	$("#createButton").hide();
	$("#saveButton").hide();
	$("#streetSelectView").show();
	$("#blockSelectView").hide();
	$("#taxonomy1").hide();
	$("#taxonomy2").hide();
	currscreen = "streets";
	$("#self-title").text(community);
}
function toBlocks() {
	blockSetup();
	$("#frmEdit").hide();
	$("#frmNew").hide();
	$("#mainlist").hide();
	$("#multilist").hide();
	$("#strnav").show();
	$(".streetSide").hide();
	$("#self-rightbutton").show();
	$("#createButton").hide();
	$("#saveButton").hide();
	$("#streetSelectView").hide();
	$("#blockSelectView").show();
	currscreen = "blocks";
	$("#self-title").text(street);
}
function toMain() {
	$("#frmEdit").hide();
	$("#frmNew").hide();
	$("#mainlist").show();
	$("#multilist").hide();
	$("#strnav").show();
	$(".streetSide").show();
	$("#self-rightbutton").show();
	$("#createButton").hide();
	$("#saveButton").hide();
	$("#streetSelectView").hide();
	$("#blockSelectView").hide();
	$("#taxonomy1").hide();
	$("#taxonomy2").hide();
	currscreen = "main";
	$("#self-title").text(street);
	scrollBy(0,-4000);
}
function toMulti() {
	$("#frmEdit").hide();
	$("#frmNew").hide();
	$("#multilist").show();
	$("#mainlist").hide();
	$("#strnav").show();
	$(".streetSide").hide();
	$("#self-rightbutton").show();
	$("#createButton").hide();
	$("#saveButton").hide();
	$("#streetSelectView").hide();
	$("#blockSelectView").hide();
	$("#taxonomy1").hide();
	$("#taxonomy2").hide();
	currscreen = "multi";
	$("#self-title").text(multiaddr + " " + street);
	scrollBy(0,-4000);
}
function toEdit(c) {
	$("#frmEdit").show();
	$("#frmNew").hide();
	$("#mainlist").hide();
	$("#multilist").hide();
	$("#strnav").hide();
	$("#self-rightbutton").hide();
	$("#createButton").hide();
	$("#saveButton").show();
	$("#streetSelectView").hide();
	$("#blockSelectView").hide();
	$("#taxonomy1").hide();
	$("#taxonomy2").hide();
	currscreen = "edit";
	$("#self-title").text("Case ID: " + c);
	scrollBy(0,-4000);
	$("body").css("background-color","#333");
	prevscr=currscreen;
	prevtitle=$("#self-title").text();
	
}
function toNew() {
	$("#frmEdit").hide();
	$("#frmNew").show();
	$("#taxonomy1").hide();
	$("#taxonomy2").hide();
	$("#mainlist").hide();
	$("#multilist").hide();
	$("#strnav").hide();
	$("#self-rightbutton").hide();
	$("#createButton").show();
	$("#saveButton").hide();
	$("#streetSelectView").hide();
	$("#blockSelectView").hide();
	currscreen = "new";
	$("#self-title").text("New Entry");
	scrollBy(0,-4000);
	$("body").css("background-color","#333");
	
	prevscr=currscreen;
	prevtitle=$("#self-title").text();
}
function toTax1() {
	console.log("totax1");
	/*if (currscreen == "new" || currscreen == "edit") {
		prevscr=currscreen;
		prevtitle=$("#self-title").text();
	}*/
	console.log(prevscr+" "+prevtitle);
	$(".formtable").hide();
	$("#taxonomy2").hide();
	$("#taxonomy1").show();
	currscreen = "tax1";
	$("#self-title").text("Category");
	scrollBy(0,-4000);
	$("body").css("background-color","#333");
	
	
}
function toTax2() {
	console.log("totax2");
	/*if (currscreen == "new" || currscreen == "edit") {
		prevscr=currscreen;
		prevtitle=$("#self-title").text();
	}*/
	console.log(prevscr+" "+prevtitle);
	$(".formtable").hide();
	$("#taxonomy1").hide();
	$("#taxonomy2").show();
	currscreen = "tax2";
	$("#self-title").text("Subcategory");
	scrollBy(0,-4000);
	$("body").css("background-color","#333");
}
function toEdit2() {
	console.log("currscr: "+currscreen);
	fromEdit=0;
	$(".formtable").show();
	$("#taxonomy1").hide();
	$("#taxonomy2").hide();
	currscreen = prevscr;
	$("#self-title").text(prevtitle);
	$("body").css("background-color","#333");
}

/*----------------------
// LOADS EACH SCREEN
------------------------*/
// Shows initial (login) screen
function showLogin(){
	$("#loggedin").hide();
	$("#login").show();
	currscreen = "login";
}
// Loads and displays list of communities
function commSetup() {
	var commTable = new Array();
	var j=0;
	for (i in streetmap) {
		//var commName = communitiesArray[i];
		commTable[j] = '<tr><td class="commLink">' + i + '</td><td width="10"><i class="icon-chevron-right grey"></i></td></tr>'
		j++;
	}
	$("#commTable").html(commTable.join(''));
	$("#commTable tr").click(function(){
						
		username=$("#login input[name='username']").val();
		var passwd=$("#login input[name='passwd']").val();
		community = $(this).find(".commLink").text();
		$("#communities").hide();
		$("#self-title").text("Loading...");
		$.ajax({
			type: 'POST',
			url: "http://www.southsidehealth.org/hhapp/server.php",
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
				toStreets();
				$("#login .loading").hide();
				$("#login").hide();
				$(".showWhenLoggedIn").show();
				// begin GPS collection
				GPSTrackingBegin();
				fillHeader();
				enableAutocomplete();
			},
			dataType: "json"
		});				
	});
}
// Loads and displays list of streets in selected community
function streetSetup() {
	var streetTable = new Array();
	for (var i in streetmap[community]) {
		var stName = streetmap[community][i];
		streetTable[i] = '<tr><td class="streetLink">' + stName + '</td><td width="10"><i class="icon-chevron-right grey"></i></td></tr>'
	}
	$("#streetList").html(streetTable.join(''));
	scrollBy(0,-4000);
	$("#streetList tr").click(function(){
		street = $(this).find(".streetLink").text();
		cs = street;
		$("#streetSelectView").hide();
		
		toBlocks();
	});			
}
// Loads and displays list of blocks on selected street
function blockSetup() {
	
	var temp=buildings[street];
		
	var blocks = new Array();
	var blockTable = new Array();
	for (i in temp) {
		blocks.push(i);
	}
	blocks.sort(numSort);
	for (i in blocks) {
		blockTable[i] = '<tr><td class="blockLink">' + blocks[i] + '</td><td width="10"><i class="icon-chevron-right grey"></i></td></tr>'
	}
	$("#blockList").html(blockTable.join(''));

		
	$("#blockList tr").click(function(){
		cb = $(this).find(".blockLink").text();
		block = cb;
		$("#blockSelectView").hide();
		$("#strnav").show();
		updateTable();
		toMain();
	});
}
// Shows list of entries
function updateTable(){
	// updates the main listing based on block/street
	console.log("updatetable: called");
	$("#mainlist #tbl tbody").hide();
	//toMain();
	$currentSection=$("#mainlist");
	console.log("updatetable: show/hide things done");
	var newId="m-"+cs.replace(/ /g,"_")+"-"+cb;
/*	if($("#"+newId).length){
		$("#"+newId).show();
		console.log("updatetable: length != 0");
	}*/
	
//	else {
		console.log("updatetable: length == 0");
		var o=$("#mainlistTemplate").clone().attr("id",newId).appendTo("#mainlist #tbl").show();

		//var trtemplate=
			o.children().remove();
		var ta=[];
		for(i in buildings[cs][cb]){ta.push(i);} ta.sort();
		for (a in ta){
			i=ta[a];
			console.log("updatetable: i="+i);
			var m=buildings[cs][cb][i];
			var eo=parseInt(i)%2?"eoo":"eoe";
			if(typeof(m)!="string"){
				//multiunit
				console.log("updatetable: rendering a multi");
				o.append($.render['mainlistEntryMULTI']({eo:eo, i:i, count:m.length}));
				//$("<tr class='multi " + eo +"'><td>"+i+"</td><td><em>MULTIPLE (" +m.length + " units)</em></td><td></td><td></td></tr>").appendTo(o);
			}
			else{
				var c=$.extend({},blank,cases[m]);
				console.log("updatetable: rendering a main");
				console.log(c);
				//o.append("<tr class='" + eo + "' id='i" + m + "'><td>"+i+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>" + cameraStatus[m] + "</td></tr>");
				o.append($.render['mainlistEntry']({eo:eo, id:m, i:i, OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(m)}));
				if(inProg["i"+m]){
					$("#i"+m+" .d").addClass("pending");
				}
			}
		} // for end
//	}
	//$(".btnActive").click();
}
//Shows entries in a multi-unit building
function multiTable(addr){
	multiaddr = addr;
	
	$currentSection=$("#multilist");
	$("#multilist #mltbl tbody").hide();
	multi=1;
	var newId="s-"+cs.replace(/ /g,"_")+"-"+addr;
	/*if($("#"+newId).length){
		$("#"+newId).show();
	}else{*/
		var o=$("#multilistTemplate").clone().attr("id",newId).appendTo("#mltbl").show();
		o.children().remove();
		var m=buildings[cs][cb][addr];

		m.sort(unitSort);

		for (i in m){
			var c=$.extend({},blank,cases[m[i]]);
			//o.append("<tr id='i" + m[i] + "' class='unit'><td>"+c['Unit']+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>" + cameraStatus[m[i]] + "</td></tr>");
			o.append($.render['multilistEntry']({id:m[i], Unit:c['Unit'], OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(m[i])}));
		}
		//}
	// populate the muaddr
	$("#muaddr").html("Units in " + addr + " " + cs);
	toMulti();
}
// Shows edit screen
function showEdit(c){
	
	clearEdit();
	var d=$.extend({},blank,cases[c]);
	// catch GARBAGE -- undefined types
	if(parseInt(d['OrgTypeCombined'])==0 || isNaN(parseInt(d['OrgTypeCombined']))){
		d['OrgTypeCombined']='0';
	}
	$("#OrgType td").each(function(){
		console.log(Math.floor(d['OrgTypeCombined']));
		console.log($(this).val());
		if($(this).val()==Math.floor(d['OrgTypeCombined'])) {
			//$(this).trigger("click");
			$("input[name='OrgType']").val($(this).attr("value"));
			$(".OrgType").text($(this).text());
			$("input[name='OrgType']").trigger("change");
			$("#OrgTypeCombined td").each(function(){
				console.log(d['OrgTypeCombined']);
				console.log($(this).val());
				if($(this).val()==d['OrgTypeCombined']) {
					//$(this).trigger("click");
					$("input[name='OrgTypeCombined']").val($(this).attr("value"));
					$(".OrgTypeCombined").text($(this).text());
					$("input[name='OrgTypeCombined']").trigger("change");
					return false;
				}
			});
			return false;
		}
	});
	
	for (i in d){
		if(i!="OrgType"){
			$("#frmEdit [name='"+i+"']").val([d[i]]);
		}
	}
	$("#frmEdit .caseidfbx").text(c);
	$('span.wac').text("Web Access Code");

	$("#frmEdit [name='Disposition'], #frmEdit [name='Private'], #frmEdit select[name='OrgTypeCombined']").trigger("change");
	processStatus(d);
	$("input").trigger("blur");
	toEdit(c);
	$("#frmEdit form").attr("data","unchanged");
	$("#frmEdit input").change(function(){
		$("#frmEdit form").attr("data","changed");
	});
}

/*----------------------
// EDIT VIEW FUNCTIONS
------------------------*/
// Sets up case id search (in menu)
function caseIDSearch(){
	$("#searchCaseID").removeClass( "error" );
	var cas=$("#caseidsearchbox").val();

	try {
		//alert(JSON.stringify(cases));
		var c=cases[cas];
		$("#streets").val(c['Street']).change();
		$("#blocknums").val(Math.floor(c['Addnum']/100)*100).change();
		$("#menubutton").click();
		$("#mainlist").hide();
		$("#multilist").hide();
		$("#streetSelectView").hide();
		$("#blockSelectView").hide();
		prevscreen=currscreen;
		showEdit(c['CaseID']);
		currscreen="searchedit";		
	}catch(e){
		$("#searchCaseID").addClass( "error" );
	}
	return false;
}
// Sets up input validation and toggle buttons
function setupValidation() {
	$(".toggle").click(function(){
		if (!$(this).hasClass("active")) $(this).addClass("btn-warning");
		else $(this).removeClass("btn-warning");
	});
		
	$(".dispOK").click(function(){
		if (!$(this).hasClass("active")) $(this).addClass("btn-success");
		$(this).siblings(".btn").each(function(){
			$(this).removeClass("btn-success");
			$(this).removeClass("btn-danger");
			$(this).removeClass("btn-warning");
			$(this).removeClass("btn-inverse");
			$(this).removeClass("btn-primary");
			$(this).removeClass("btn-info");
				
		});
	});
	$(".dispGone").click(function(){
		if (!$(this).hasClass("active")) $(this).addClass("btn-danger");
		$(this).siblings(".btn").each(function(){
			$(this).removeClass("btn-success");
			$(this).removeClass("btn-danger");
			$(this).removeClass("btn-warning");
			$(this).removeClass("btn-inverse");
			$(this).removeClass("btn-primary");
			$(this).removeClass("btn-info");
		});
	});
	$(".unsure").click(function(){
		if (!$(this).hasClass("active")) $(this).addClass("btn-warning");
		$(this).siblings(".btn").each(function(){
			$(this).removeClass("btn-success");
			$(this).removeClass("btn-danger");
			$(this).removeClass("btn-warning");
			$(this).removeClass("btn-inverse");
			$(this).removeClass("btn-primary");
			$(this).removeClass("btn-info");
				
		});
	});
	$(".dispUntchd").click(function(){
		//if (!$(this).hasClass("active")) $(this).addClass("btn-inverse");
		$(this).siblings(".btn").each(function(){
			$(this).removeClass("btn-success");
			$(this).removeClass("btn-danger");
			$(this).removeClass("btn-warning");
			$(this).removeClass("btn-inverse");
			$(this).removeClass("btn-primary");
			$(this).removeClass("btn-info");
		});
			
	});
		
	$(".dispDup").click(function(){
		if (!$(this).hasClass("active")) $(this).addClass("btn-info");
		$(this).siblings(".btn").each(function(){
			$(this).removeClass("btn-success");
			$(this).removeClass("btn-danger");
			$(this).removeClass("btn-warning");
			$(this).removeClass("btn-inverse");
			$(this).removeClass("btn-primary");
			$(this).removeClass("btn-info");
		});
	});
	$(".dispOOS").click(function(){
		if (!$(this).hasClass("active")) $(this).addClass("btn-info");
		$(this).siblings(".btn").each(function(){
			$(this).removeClass("btn-success");
			$(this).removeClass("btn-danger");
			$(this).removeClass("btn-warning");
			$(this).removeClass("btn-inverse");
			$(this).removeClass("btn-primary");
			$(this).removeClass("btn-info");
		});		
	});
		
	$("input[name='Phone']").blur(function(){
		var phone = $(this).val();
		if (phone=="") {
			$(this).parent().removeClass("error");
			$(this).parent().removeClass("success");
			$(this).parents("tr").css("background-color","");
			$("#phoneBtn").children("i").addClass("icon-grey");
			$("#phoneBtn").removeAttr("href");
			
			return;
		}
		var phoneDigits = phone.replace(/[^0-9]/g, '');
			
		if (phoneDigits.length==10) {
			$(this).parent().removeClass("error")
			$(this).parent().addClass("success");
			$(this).parents("tr").css("background-color","#060");
			var phoneFormatted = phoneDigits.substr(0,3)+"-"+phoneDigits.substr(3,3)+"-"+phoneDigits.substr(6,4);
			$(this).val(phoneFormatted);
			$("#phoneBtn").children("i").removeClass("icon-grey");
			var tel = "tel:"+phoneDigits;
			$("#phoneBtn").attr("href",tel);
			
		}
		else if (phoneDigits.length==11 && phoneDigits.substr(0,4)=="1800") {
			$(this).parent().removeClass("error")
			$(this).parent().addClass("success");
			$(this).parents("tr").css("background-color","#060");
			var phoneFormatted = phoneDigits.substr(1,3)+"-"+phoneDigits.substr(4,3)+"-"+phoneDigits.substr(7,4);
			$(this).val(phoneFormatted);
			$("#phoneBtn").children("i").removeClass("icon-grey");
			var tel = "tel:"+phoneDigits;
			$("#phoneBtn").attr("href",tel);
		}
		
		else {
			$(this).parent().removeClass("success")
			$(this).addClass("error");
			$(this).parents("tr").css("background-color","#600");
			$("#phoneBtn").children("i").addClass("icon-grey");
			$("#phoneBtn").addClass("disabled");
			$("#phoneBtn").removeClass("btn-success");
			$("#phoneBtn").removeAttr("href");
			
		} 
			
	});
	$("input[name='OrgName']").blur(function(){
		var name = $(this).val();
		$(this).val(titleCaps(name));
	});
	$("input[name='Email']").blur(function(){
		var email = $(this).val();
		if (email=="") {
			$(this).parent().removeClass("error");
			$(this).parent().removeClass("success");
			$(this).parents("tr").css("background-color","");
			$("#emailBtn").children("i").addClass("icon-grey");
			$("#emailBtn").removeAttr("href");
			
			return;
		}
		
		if (/^.+@.+\..+$/.test(email)) {
			$(this).parent().removeClass("error");
			$(this).parent().addClass("success");
			$(this).parents("tr").css("background-color","#060");
			$("#emailBtn").children("i").removeClass("icon-grey");
			var mt = "mailto:"+email;
			$("#emailBtn").attr("href",mt);
			
		}
		else {
			$(this).parents("tr").css("background-color","#600");
			$(this).parent().removeClass("success");
			$(this).parent().addClass("error");
			$("#emailBtn").children("i").addClass("icon-grey");
			$("#emailBtn").removeAttr("href");
			
		} 	
	});
	$("input[name='URL']").blur(function(){
		var url = $(this).val();
		if (url=="") {
			$("#URLBtn").children("i").addClass("icon-grey");
			$("#URLBtn").removeAttr("href");
		}
		else {
			if (url.substr(0,7)!="http://") url = "http://"+url;
			$("#URLBtn").children("i").removeClass("icon-grey");
			$("#URLBtn").attr("href",url);	
		}
	});
	
}
// Loads status data into buttons
function processStatus(d) {
	var disp = d['Disposition'];
	if (disp=="Okay") $(".dispOK").click();
	else if (disp=="Gone") $(".dispGone").click();
	else if (disp=="Dup") $(".dispDup").click();
	else if (disp=="OOS") $(".dispOOS").click();
	else if (disp=="Untchd") $(".dispUntchd").click();
	else if (disp=="Unsure") {
		if (d["DKName"]=="Yes") $(".dkname").click();
		if (d["DKAddress"]=="Yes") $(".dkaddress").click();
		if (d["DKOpen"]=="Yes") $(".dkopen").click();
		if (d["DKType"]=="Yes") $(".dktype").click();
	}
}
// Generates status from button states (on save)
function recordStatus(d) {
	var disp = "Untched";
	var DKName = "";
	var DKAddress = "";
	var DKOpen = "";
	var DKType = "";
	if ($(".dispOK").hasClass("btn-success")) disp = "Okay";
	else if ($(".dispGone").hasClass("btn-danger")) disp = "Gone";
	else if ($(".dispOOS").hasClass("btn-info")) disp = "OOS";
	else if ($(".dispDup").hasClass("btn-info")) disp = "Dup";
	else if ($(".unsure").hasClass("btn-warning")) {
        console.log("something is unsure! "+disp);
		//Allow DKs for statuses other than Unsure (@req David)
		if (disp=="Untched") disp = "Unsure";
        console.log("disp set unsure? "+disp);
		if ($(".dkname").hasClass("btn-warning")) DKName="Yes";
		if ($(".dkaddress").hasClass("btn-warning")) DKAddress="Yes";
		if ($(".dkopen").hasClass("btn-warning")) DKOpen="Yes";
		if ($(".dktype").hasClass("btn-warning")) DKType="Yes";
	}
	if (disp=="Untched") {
		return 0;
	}
	d['Disposition'] = disp;
	d['DKName'] = DKName;
	d['DKAddress'] = DKAddress;
	d['DKOpen'] = DKOpen;
	d['DKType'] = DKType;
	return d;
}
// Processes edit form (OrgType, etc)
function procForm(f){
	var $f=$(f);
	$("#OrgType").html("");
	//$("select[name='OrgType']",$f).empty();
	for(var i in t){
		var theVal = t[i][0];
		//$("select[name='OrgType']",$f).append($("<option>").val(theVal).html(theVal +" "+t[i][1]));
		$("#OrgType").append($("<tr>").html($("<td>").html(theVal +" "+t[i][1]).attr("value",theVal)))
	}
	$(".OrgType").click(function(){
		toTax1();
	});
	$(".OrgTypeCombined").click(function(){
		fromEdit=1;
		toTax2();
	});
	
	$("#OrgType td").click(function(){
		var orgtype = ""+$(this).attr("value");
		console.log("orgtype: " + orgtype);
		$("input[name='OrgType']").val(orgtype);
		$(".OrgType").text($(this).text());
		//console.log($("select[name='OrgType']",$f).val());
		$("input[name='OrgType']").trigger("change");
		//$("#OrgTypeCombined td:first").trigger("click");
		$("input[name='OrgTypeCombined']").val($("#OrgTypeCombined td:first").attr("value"));
		$(".OrgTypeCombined").text($("#OrgTypeCombined td:first").text());
		$("input[name='OrgTypeCombined']").trigger("change");
		
		toTax2();
	});
	
	$("input[name='OrgType']").change(function(){
		console.log("orgtype willchange");
		var v=$(this).val();
		if (v){
			var temp=t[v][2];
			//load up subtype
			$("select[name='OrgTypeCombined'] option",$f).remove();
			$("#OrgTypeCombined").html("");
			for(i in temp){
				var theValue = parseFloat(temp[i][0]).toFixed(2);
				$("select[name='OrgTypeCombined']",$f).append($("<option>").val(parseFloat(temp[i][0]).toFixed(2)).html(parseFloat(temp[i][0]).toFixed(2) +" "+temp[i][1]));
				$("#OrgTypeCombined").append($("<tr>").html($("<td>").html(theValue +" "+temp[i][1]).attr("value",theValue)))	
			}
			$("#OrgTypeCombined td").click(function(){
				console.log($(this).attr("value"));
				$("input[name='OrgTypeCombined']").val($(this).attr("value"));
				$(".OrgTypeCombined").text($(this).text());
				$("input[name='OrgTypeCombined']").trigger("change");
				toEdit2();
			});
		}
	});
	
	
	$("input[name='OrgTypeCombined']").change(function(){
		//IF IS FINAL OPTION ---> OTHER BOX
		if($(".OrgTypeCombined").text().indexOf("Other")>=0){
			$("#OrgTypeOther",$f).show();
		}else{
			$("#OrgTypeOther",$f).hide();
		}
	});


	$("[name='Disposition']",$f).change(function(){
		if($("option:selected", this).text()=="Unsure"){
			$(".ifUnsureDisp",$f).show();
		}else{
			$(".ifUnsureDisp",$f).hide();
		}
	});
	$("[name='Private']",$f).change(function(){
		if($("[name='Private']",$f).is(":checked")){
			$(".conditionalPrivate",$f).show();
		}else{
			$(".conditionalPrivate",$f).hide();
		}
	});
	

	// PROCESS
	$("[name='OrgType']",$f).change();
	$("[name='Disposition'], [name='Private']",$f).change();
}

/*----------------------
// HELPER FUNCTIONS
------------------------*/
// New helper functions
function fillHeader() {
	var $h=$("#header");
	$h.find(".username").text(username);
	$h.find(".total").text(totalCases);
	//erase old table
	$("#mainlist #tbl tbody:not([id=mainlistTemplate])").remove();
	$("#multilist #mltbl tbody:not([id=multilistTemplate])").remove();
}
function enableAutocomplete() {
	$("#frmNew [name='Street'], #frmEdit [name='Street']").autocomplete({
		source: streetmap[community]
	}).blur(function (){
		if(streetmap[community].indexOf($(this).val())==-1){
			$(this).val("");
		}

	});
}
function dispIcons(disp) {
	if (disp=="Untched") return " ";
	else if (disp=="Okay") return "<i class='icon-ok'></i>";
	else if (disp=="Unsure") return "<i class='icon-question-sign'></i>";
	else if (disp=="Gone") return "<i class='icon-ban-circle'></i>";
	else if (disp=="Dup" | disp=="OOS") return "<i class='icon-info-sign'></i>";
	return " ";
}
function wireButtons() {
	$("#privateResidence .yes").click(function(){
		$(this).addClass("btn-primary");
		$(this).siblings(".no").removeClass("btn-primary");
		$("input[name='Private']").prop("checked",true);
		$("input[name='Private']").trigger("change");
	});
	$("#privateResidence .no").click(function(){
		$(this).addClass("btn-primary");
		$(this).siblings(".yes").removeClass("btn-primary");
		$("input[name='Private']").prop("checked",false);
		$("input[name='Private']").trigger("change");
	});
	$("#permissionToPost .yes").click(function(){
		$(this).addClass("btn-primary");
		$(this).siblings(".no").removeClass("btn-primary");
		$("input[name='post_it']").prop("checked",true);
		$("input[name='Private']").trigger("change");
	});
	$("#permissionToPost .no").click(function(){
		$(this).addClass("btn-primary");
		$(this).siblings(".yes").removeClass("btn-primary");
		$("input[name='post_it']").prop("checked",false);
		$("input[name='Private']").trigger("change");
	});
	
	
	$("#btnLogin").click(function(){
		document.addEventListener("backbutton", androidBackButton, true);
		console.log("added back button listener");
		$("#loginForm").hide();
		$("#self-leftbutton").css("visibility","visible");
		$("#communities").show();
		$("#self-title").text("Communities");
		currscreen = "communities";

	});
	$("#saveButton").click(function(){
		editForm.buttons.Save();
	});
	$("#createButton").click(function(){
		newForm.buttons.Create();
	});
	$("#caseidsearchbox").focus(function(){$("#strnav").hide;});
	$("#caseidsearchbox").blur(function(){$("#strnav").show;});

	$("#caseidbx button:eq(0)").click(function(){
		try {
			var c=cases[$("#caseidbx input").val()];
			$("#streets").val(c['Street']).change();
			$("#blocknums").val(Math.floor(c['Addnum']/100)*100).change();
			showEdit(c['CaseID']);
			$("#caseidbx").hide();
		}catch(e){
			$("#caseidbx input").addClass( "ui-state-error" );
		}
	});
	$("#btnCaseId").click(function(){
		//prompt for caseid
		$(".section").hide();
		$("#caseidbx").show();
	});
	$("#btnEven").click(function(){$("#btngroup li").removeClass("btnActive");$(this).addClass("btnActive");$("tr.eoo").hide();$("tr.eoe").show();});
	$("#btnOdd").click(function(){$("#btngroup li").removeClass("btnActive");$(this).addClass("btnActive");$("tr.eoe").hide();$("tr.eoo").show();});
	$("#btnAll").click(function(){$("#btngroup li").removeClass("btnActive");$(this).addClass("btnActive");$("tr.eoe").show();$("tr.eoo").show();}).click();
	$("#btnBack").click(function(){goBack(0);});
	$("#btnAddNew").click(function(){
		toNew();
		newForm.open();
	});

	$("#header a").on("click",showLogin);

	$("#mainlist").on("click","tbody tr",function(e){
		if($(this).hasClass("multi")){
			multiTable($(".addr",this).text());
			e.stopPropagation();
		}else{
			showEdit($(this).attr("id").substr(1));
			e.stopPropagation();
		}
	});
	$("#multilist #mltbl").on("click", "tbody tr", function(e){
		showEdit($(this).attr("id").substr(1));
		e.stopPropagation();
	});
	$("#mainlist, #multilist").on("click", "td:has(i.icon-camera)",function(e){
		$("#overlay").show()
		e.stopPropagation();
		// launchCamera
		var caseid=$(this).parents("tr").attr("id").substr(1);
		takePhoto(caseid);
		$("#overlay").hide()
		
	});
	$('button.wac').on('click',function(){$("span.wac",this).text(cg($("#frmEdit input[name='CaseID']").val()));});

	//make a "new form"
	$("#frmEdit").clone().attr('id','frmNew').appendTo($("body"));
	$("#frmNew .wac").remove();
	procForm("#frmNew");

	$("#frmNew .ui-dialog-title").text('Create New Case');
	$("#frmNew .ui-dialog-buttonpane button:eq(0) span").text("Create").click(function(){
		newForm.buttons.Create();
		$("#frmNew").hide();
		$currentSection.show();
	});


	$("#frmEdit .ui-dialog-title").text('Edit Case');
	$("#frmEdit .ui-dialog-buttonpane button:eq(0) span").click(function(){
		editForm.buttons.Save();
		$("#frmEdit").hide();
		$currentSection.show();
	});
	$("#multilist a span, #muaddr").click(function(){$("#multilist,#mainlist").toggle(); $currentSection=$("#mainlist");});

	$("span.ui-icon-closethick, .cancelbuttn").click(function(){ $(this).parents(".section").hide(); $currentSection.show(); });
	
}


// Unmodified helper functions
function clearEdit(){$("#frmEdit form")[0].reset();}
function cg(c){ var a="000000"+(c*70039%16777213).toString(16);a=a.slice(-6,a.length);var t=0;for(i in a.split(""))t+=parseInt(a[i],16)*((2*i+1)+2*(Math.floor(i/4)));t%=16;return a+t.toString(16); }
function unitSort(a,b){
	var uA = cases[a].Unit.toLowerCase();
	var uB = cases[b].Unit.toLowerCase();
	if (uA < uB) {return -1; };
	if (uA > uB) {return 1; };
	return 0;
}
function numSort(a,b){
	return parseInt(a)-parseInt(b);
}
$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

/*----------------------
// UNUSED FUNCTIONS
------------------------*/
// renderAddr no longer used
function renderAddr(s,b,a){
	var m=buildings[s][b][a];
	var eo=parseInt(i)%2?"eoo":"eoe";
	var o=$("#m-"+s.replace(/ /g,"_")+"-"+b);
	var newRow=null;
	//var isMulti=false;
	var so=null;

	if (m===undefined){
		o.find("tr").find("td:eq(0):contains(" + a +")").parent().remove();
		return;
	}

	if(typeof(m)!="string"){
		//isMulti=true;
		//multiunit, so make both
		// main
		//newRow=$("<tr class='multi " + eo +"'><td>"+a+"</td><td><em>MULTIPLE (" +m.length + " units)</em></td><td></td><td></td></tr>");
newRow=$.render['mainlistEntryMULTI']({eo:eo, i:a, count:m.length});
		//unit
		so=$("#s-"+s.replace(/ /g,"_")+"-"+a);

		if(so.length){
			so.children().remove();
		}else{
			so=$("#multilistTemplate").clone().attr("id","s-"+s.replace(/ /g,"_")+"-"+a).appendTo("#mltbl");
		}

		m.sort(unitSort);
		for (i in m){
			var c=$.extend({},blank,cases[m[i]]);
			//so.append("<tr id='i" + m[i] + "' class='unit'><td>"+c['Unit']+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>" + cameraStatus[m[i]] + "</td></tr>");
			so.append($.render['multilistEntry']({id:m[i], Unit:c['Unit'], OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(m[i])}));
			

		}
	}else{
		var c=$.extend({},blank,cases[m]);
		//newRow=$("<tr class='" + eo + "' id='i" + m + "'><td>"+a+"</td><td>" + c['OrgName'] + "</td><td>" + c["Disposition"] + "</td><td>" + cameraStatus[m] + "</td></tr>");
		newRow=$.render['mainlistEntry']({eo:eo, id:m, i:a, OrgName:c['OrgName'], Disposition:dispIcons(c['Disposition']), cameraStatus:cameraStatus.get(m)});
		
		
	}

	// does this already exist?
	var row=o.find("tr").find("td:eq(0):contains(" + a +")").parent();
	console.log("from renderAddr:");
	console.log(o);
	if(row.length){
		// exists ...
		row.replaceWith(newRow);
	}else{
		//insert as new
		o.append(newRow);
	}

	if(inProg["i"+m]){
		$("#i"+m+" .d").addClass("pending");
	}
}
// populateDisplay no longer used
function populateDisplay(){
	// header
	//$("#header").html( </a> (" + totalCases+ " total cases)");
	

	/*//fill streets
	$("#streets option").remove();
	for (i in buildings){
		$("#streets").append($("<option>").text(i));
	}
	//blocknums
	$("#blocknums").change(function(){
		$(".dlg").hide();
		cb=$(this).val();
		updateTable();
	});*/

	//link blocks to streets
	/*$("#streets").change(function(){
		$(".dlg").hide();
		var v=$(this).val();
		var temp=buildings[v];
		//load up subtype
		$("#blocknums option").remove();
		var ta=[];
		for(i in temp){ ta.push(i); } ta.sort(numSort);
		for(i in ta){
			$("#blocknums").append($("<option>").text(ta[i]));
		}
		cs=v;
		$("#blocknums").change();
	}).change();*/

	// make valid street dropdown for edit/new

	
}

/*----------------------
// PHONEGAP CAMERA/GPS FUNCTIONS
------------------------*/
// unchanged with the exception of new div names and 
// removal of error message upon manual camera dismiss
function updateCheck(){
	$.ajax({
		type: 'GET',
		url: "http://www.southsidehealth.org/hhapp/version.php",
		//cache: false,
		data: version,
		success: function(data){
			//console.log(data);
			if (data.version>version){
				// need to update ... so add link to apk
				//$("body").append($("<a>").attr({"href":"http://www.southsidehealth.org/hhapp/MAPSCorps.apk"}).text("Update Available!"));
				$("body").append($("<strong>").text("Update Available!"));
			}
		},
		error: function(xhr){
			console.log(xhr);
			alert("Error: Update check failed.");
		},
		dataType: "json"
	});
	
}
var caseid=null, imageURI=null;
function takePhoto(cid){
	caseid=cid;
	navigator.camera.getPicture(takePhotoSuccess, takePhotoFail, { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI }); 
}
function takePhotoSuccess(iURI) {
	imageURI=iURI;
	AppDB.transaction(savePhoto, errorAppDB, savePhotoSuccess);
	
}

function takePhotoFail(message) {
	// removed photo failed alert — not necessary
	//alert('Failed because: ' + message);
}

function savePhoto(tx){
	var ts=new Date().getTime();
	var sqlString='INSERT INTO Cam (ts, user, caseid, imageUri, uploadstatus) VALUES (' + ts + ',"' + username + '","' + caseid + '","' + imageURI + '",0)';
	//alert(sqlString);
	tx.executeSql(sqlString);
}

function savePhotoSuccess(){
	// photo has been saved to into SQLite DB
	// update UI
	cameraStatus.set(caseid);
	$("tr#i"+caseid).find("i.icon-camera").removeClass("icon-gray");
	cameraUploadPrep();
}
var successfulUploads=null;
function uploadPhoto(){
	// select * from Cam where uploadStatus!=0
	// post those images
	// update Cam on success
	// update UI
	successfulUploads=[];
	AppDB.transaction(
		function (tx) {
			tx.executeSql(
				'SELECT * FROM Cam WHERE uploadstatus==0', [], 
				function (tx, results) {
					if(results.rows.length){
						var $ul=$("#cam_messages");
						var len=results.rows.length;
						for (var i=0; i<len; i++){
							var temp=results.rows.item(i);
							//alert(JSON.stringify(temp));
							$ul.append($("<li>").text("CaseID: "+ temp.caseid + " uploading...").attr('rel',temp.ts).addClass("pending"));
							
							var options = new FileUploadOptions();
							options.fileKey="file";
							options.fileName=temp.imageUri.substr(temp.imageUri.lastIndexOf('/')+1);
							options.mimeType="image/jpeg";
							
							options.params = $.extend({machineid:device.uuid},temp);
							options.chunkedMode = false;
							//alert(JSON.stringify(options));
							var ft = new FileTransfer();
							ft.upload(temp.imageUri, "http://www.southsidehealth.org/hhapp/2012-images.php", win, fail, options);
						}
					}
				},
				errorAppDB
			);
		}, 
		errorAppDB,
		function(){
			//success
			//alert("uploaded!");
		}
	);

	
	
	
}


function win(r) {
	//alert(JSON.stringify(r));
	var $thing=$("#cam_messages").find("li[rel='"+r.response+"']");
	$thing.text($thing.text() + " complete.").removeClass("pending").hide(2000,function(){$(this).remove();});
	AppDB.transaction(function(tx){tx.executeSql('UPDATE Cam SET uploadstatus=1 WHERE ts='+r.response);}, errorAppDB, cameraUploadPrep);
	//console.log("Code = " + r.responseCode);
	//console.log("Response = " + r.response);
	//console.log("Sent = " + r.bytesSent);
}

function fail(error) {
	alert("An error has occurred: Code = " + error.code);
	alert(JSON.stringify(error));
	console.log("upload error source " + error.source);
	console.log("upload error target " + error.target);
}

function cameraUploadPrep(){
	AppDB.transaction(
		function (tx) {
			tx.executeSql(
				'SELECT * FROM Cam WHERE uploadstatus==0', [], 
				function (tx, results) {
					$("#camera").find("span").text((results.rows.length?results.rows.length:"No") + " images to upload.");
					if(results.rows.length){
						// show enabled button
						$("#camera .upload").removeClass("disabled");
					}else{
						// show disabled
						$("#camera .upload").addClass("disabled");
					}
				},
				errorAppDB
			);
		}, 
		errorAppDB
	);
}

// api-geolocation Watch Position
function wsuccess(pos) {
	/*
	var text = "<li>Latitude: " + pos.coords.latitude +
	" (watching)<br/>" + "Longitude: " + pos.coords.longitude + "<br/>" +
	"Accuracy: " + pos.coords.accuracy + "m<br/>" + "</li>";
	*/
	if(debug){
		$("#cur_position").append(JSON.stringify(pos));
	}
	GPSTracker.push([new Date().getTime(),username,pos]);
	//console.log(text);
};
function wfail(error) {
	if(debug){
		$("#cur_position").append("<li>Error getting geolocation: " + error.code+" message=" + error.message +"</li>");
	}
	//console.log("Error getting geolocation: code=" + error.code + " message=" + error.message);
};

function GPSTrackingBegin(){
	GPSTrackingEnd();
	if(debug){
		$("#cur_position").append("<li>Watching geolocation . . .</li>");
	}
	//console.log("Watching geolocation . . .");
	//var options = { frequency: 3000, maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };
	//navigator.geolocation.watchPosition(wsuccess, wfail, options);
	watchID = setInterval("tgeo()",15000); // was 3000 for testing, now 15 secs
}

function GPSTrackingEnd(){
	if (watchID !== null) {
		navigator.geolocation.clearWatch(watchID);
		window.clearInterval(watchID);
		watchID = null;
	}
}

function tgeo(){
	navigator.geolocation.getCurrentPosition(wsuccess, wfail);
}

// api-storage  "Create DB"
function setupAppDB(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS GPS (ts, user, data)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS Cam (ts unique, user, caseid, imageUri, uploadstatus)');
}
function errorAppDB(err) {
	//alert(err.code);
	alert(err.message);
	
	console.log("Error processing SQL: " + err.code);
}
function successSetupAppDB() {
	// now we can create timer, and populate
	gpsFlushID = setInterval("GPSFlush()",300000); // every 5 mins
}
function wipeGPS(tx){
	tx.executeSql('DROP TABLE IF EXISTS GPS');
	tx.executeSql('CREATE TABLE IF NOT EXISTS GPS (ts, user, data)');
}
function createAppDB(){
	if (!AppDB) {
		AppDB = window.openDatabase("MAPSCorpsDB", "1.0", "MAPSCorps DB", 5000000);
	}
	AppDB.transaction(setupAppDB, errorAppDB, successSetupAppDB);
}

function GPSFlush(){
	//check local var and add to db
	if (GPSTracker && GPSTracker.length>0){
		AppDB.transaction(GPSFlushDB, errorAppDB);
	}
	checkGPS(); 
}

function GPSFlushDB(tx) {
	var record=null;
	while (record=GPSTracker.shift()){
		//alert(JSON.stringify(record));
		tx.executeSql('INSERT INTO GPS (ts,user,data) VALUES (' + record[0] + ',"' + record[1] + '",\'' + JSON.stringify(record[2]) + '\')');
	}
}
function checkGPS(){
	AppDB.transaction(
		function(tx){
			tx.executeSql('SELECT * FROM GPS', [], 
				function(tx, results) {
					if(results.rows.length || GPSTracker.length){
						// show enabled button
						$("#gpsreport").find("span").text("GPS data to upload.").end().find(".upload").removeClass("disabled");
					}else{
						// show disabled
						$("#gpsreport").find("span").text("No GPS data to upload.").end().find(".upload").addClass("disabled");
					}
				}, 
				errorAppDB
			);
		},
		errorAppDB
	);
}
function writeGPSDB(){
	if (GPSTracker && GPSTracker.length>0){
		AppDB.transaction(GPSFlushDB, errorAppDB, readyWriteGPS);
	}else{
		readyWriteGPS();
	}
}

function readyWriteGPS(){
	AppDB.transaction(queryGPSDB, errorAppDB);
}

function queryGPSDB(tx) {
	tx.executeSql('SELECT * FROM GPS', [], goWriteGPS, errorAppDB);
}

function goWriteGPS(tx, results) {
	if(results.rows.length){
		var len=results.rows.length;
		var temp=[];
		for(var i=0;i<len;i++){
			temp.push(results.rows.item(i));
		}
		//alert(JSON.stringify(temp));
		$.ajax({
			type: 'POST',
			url: "http://www.southsidehealth.org/hhapp/GPSDB-2012.php",
			//cache: false,
			data: {machineid:device.uuid, gps:temp},
			success: function(data){
				// alert(data);
				// wipe local gps
				AppDB.transaction(wipeGPS, errorAppDB,checkGPS);
			},
			dataType: "json"
		});
	}
}
var cameraStatus={
	get:function(caseid){
		if (cameraStatus.data[caseid]){
			return "";
		}
		return 'icon-gray';
	},
	set:function(caseid){
		cameraStatus.data[caseid]=1;
	},
	data:{}
};

function onDeviceReady() {
	createAppDB();
}

document.addEventListener("deviceready",onDeviceReady,false);


$("#watch").toggle(function(){GPSTrackingBegin();},function(){GPSTrackingEnd();});
$("#camera .upload").on("click",function(){uploadPhoto();});
$("#gpsreport .upload").on("click",function(){writeGPSDB();});

$(".list").on("click", function(){
		AppDB.transaction(function (tx) {
				tx.executeSql(
					'SELECT * FROM Cam WHERE uploadstatus==0', [], 
					function (tx, results) {
						if(results.rows.length){
							var $ul=$("#cam_messages");
							var len=results.rows.length;
							for (var i=0; i<len; i++){
								var temp=results.rows.item(i);
								//alert(temp);
								$ul.append($("<li>").text(JSON.stringify(temp)));
							}
						}
					},
					errorAppDB
				);
			}, 
			errorAppDB
		);
});

$("#btnDebug").on("click",function(){debug=!debug;$("#debug").toggle();});
$("#clearWatch").on("click",function(){$("#cur_position").empty();});
$("#wgps").on("click",function(){GPSTrackingEnd();AppDB.transaction(wipeGPS, errorAppDB);});
