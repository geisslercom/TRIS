/**	
 * @author Benjamin Geißler <b.geissler89@googlemail.com>
 * @file Contents the needed functions for the Chrome Extension
 */


/**
 * Dependencie injection
 */

var mongoose = require('mongoose');
var t        = require('../modules/trello-bridge');
var syncList = require('../models/syncLists');

/**
 * Collection of extensional functions
 * @type {Object}
 */
var extension = {
	/**
	 * Setup a Request to Trello to get the Boards containing List
	 * @param  {string}   BoardID  The Long Board ID
	 * @param  {Function} callback a function containing the returning data in the first parameter
	 */
	getListofBoard : function(BoardID,callback){
		var filterObj = {
			cards:'none'
		};

		t.get('/1/board/'+BoardID+'/lists', filterObj, function(err,data){
			if (err) console.error(err);
			// console.log(data);
			callback(data);
		});	
	},

	/**	
	 * Filters the Syncedlists of given list with the Datebase
	 * @param  {array} lists     array of lists object
	 * @param  {function} callback0 call after the datbase has found something
	 */
	getSyncedListsOfBoard : function(lists,callback0){
		var syncedLists = {};
		var findI       = 0;

		var doFind = function (list,callback1){
			var findObj       = {
				$or : [
					{"list1": {
						id : list.id,
						name : list.name
					}},
					{"list2": {
						id : list.id,
						name : list.name
					}}
				]
			};

			var filterObj = {
				"_id":1,
				"list1":1,
				"list2":1
			};


			syncList.find(findObj ,filterObj,function (error,data){
				// console.log('getSyncedListsOfBoard' , 'doFind', data);
				if (error) console.log(error);

				for (var i in data){
					// console.log("list:", list);
					if (data[i].list1.id == list.id) {
						syncedLists[list.id] = list.name;
					}else if(data[i].list2.id == list.id){
						syncedLists[list.id] = list.name;
					};
				}
				// console.log("syncedLists", syncedLists);
				if (typeof(callback1)!='undefined'){callback1();}
			});
		}; //--End of doFind()

		//runs through every list object and calls the doFind methode after eachanother
		lists.map(function(element,index){
				doFind(element, function(){
					// console.log("check if ends", lists.length-1, index);
					if (lists.length-1 == index) {
						callback0(syncedLists)
					};
				});
        });
	},

	/**	
	 * Setup a Trello Request to get the whole Boards and run through this to grab the one who name fits in
	 * @param  {string}   boardname The name of the wanted Board
	 * @param  {Function} callback  function to pass the wanted data back to the origin
	 */
	getBoardIdByName : function(boardname,callback){
		t.get('/1/members/my/boards',{filter:"open"},function(err,data){
			if (err) {console.error(err)};
			
			for(var board in data){
				if (data[board].name === boardname) {
					callback(err,data[board].id);
					break;
				};
			}
		});
	},

};

//Delievers the Collection object back to the app
module.exports = extension; 