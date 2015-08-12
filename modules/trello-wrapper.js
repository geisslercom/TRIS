var t        = require('../modules/trello-bridge');
var syncList = require('../models/syncLists');

/**	
 * Collection of default functionality
 * @type {Object}
 */
var RoutingExp = {
	/**
	 * Easily logging basic trello request
	 * @param  {object} trReq The Trello Request Body Object
	 */
	logAction : function(trReq){
		console.info(trReq.body.action.memberCreator.fullName + " does " + trReq.body.action.type + " with: "+ trReq.body.model.name);
	},

	/**
	 * Working a Trello-Request from a Webhook listened on a List
	 * @param  {object} trReq The Trello Request Body Object
	 */
	listHookController : function(trReq){
		var action   = trReq.body.action;
		var model    = trReq.body.model;

		/**
		 * Function to handle a update
		 * @param  {object} data Database Document Object
		 */
		var onResult = function (data){
			if (typeof(data) != 'undefined') {
				var destList = (model.id == data.list1.id) ? data.list2.id : data.list1.id; 

				//sends the action with data to a function which handels the editing process of a card
				trelloAPI.tunnelUpdateToDestCard(data , action , destList );
			};
		};

		/**
		 * Function to find a Database Document on the depend Key
		 * @param  {string} listkey Key of the wanted Document Key-Element
		 */
		var doFind = function (listkey){
			var findObj       = {};
			findObj[listkey]      = {};
			findObj[listkey].id   = model.id;
			findObj[listkey].name = model.name;
			
			//Searches in the Collection for the Object meantion above			
			syncList.find(findObj , function (error,DbResult) {
				if (error) return console.error(error);

				//For every search result
				for (var i in DbResult){

					onResult(DbResult[i]);
					
					//Saves the Listname in the Document if it is not already inside
					if (typeof(DbResult[i][listkey].name) == 'undefined') {
						RoutingExp.saveListName(model.name, DbResult[i], listkey);
					};
				}
			});
		};

		/**
		 * Two execution cause of two possible Key Values
		 * @todo  rewrite in the way of the extension-controller
		 */

		doFind('list1');
		doFind('list2');


	},

	/**
	 * Just saving the listname into the document
	 * @param  {string} modelname Name of the List
	 * @param  {object} dbObj     Database Document
	 * @param  {string} listid    listid of the Document-Key in the Document
	 */
	saveListName : function(modelname , dbObj, listid){

		dbObj[listid].name = modelname;
		dbObj.save(function(err,data){
			if (err) {console.error(err)};
		});

	},

	/**
	 * Register a new Hook on t
	 * @param  {[type]} trReq [description]
	 */
	registerController: function(Req){
		var hookRoute       = Req.params.type; //For differencing the hook on his hookmodel
		var hookid          = Req.params.id; //id of the model which shall be hooked

		//resgister the Hook at Trello
		trelloAPI.postWebhook(hookid , hookRoute, function(modelid, resBody, state){
			console.log("Hook created with: "+state);
			if (!state) console.log(resBody);
		});
	},

	/**
	 * Register an new Two Way Sync on a List
	 * @param {object} ClientReq A Request comming typicaly from a maintence side
	 * @todo  add functionallity for extension request
	 */
	setNewSyncController : function(ClientReq){
		var webhookAlreadyConst = 'A webhook with that callback, model, and token already exists';
		var listHookR           = 'ListHook';
		//For collect the found Elment globally
		var modelStore             = {};

		//A new Document Object for the Database
		var syncDbDoc 		= new syncList({
			list1:{
				id:ClientReq.params.id1
			},
			list2:{
				id:ClientReq.params.id2
			}
		});

		//@callback
		var ResponseHandler  = function(modelid,resBody, state) {
			modelStore[modelid] = state;

			//If a Webhook on the modelid exits set the state also to true
			if (resBody.indexOf(webhookAlreadyConst) >= 0) {
				modelStore[modelid] = true;
			}

			if (modelStore[syncDbDoc.list1.id] && modelStore[syncDbDoc.list2.id]) {
					//When both Webhook were created store the linked-listid in the mongodb
					var searchCriteria = {
						list1:{
							id: syncDbDoc.list1.id
						},
						list2:{
							id: syncDbDoc.list2.id
						}
					};

					syncList.find(searchCriteria ,function(err,data){
						console.log(data);
						if (!(data.length)) {
							syncDbDoc.save(function (error,data) {
								if (error) return console.error(error);
								console.log("Object saved");
							});
						}
					});
			};
		};

		//Register two new Webhook with the Listhook Route the Function above is the Callbackhandler
		trelloAPI.postWebhook(syncDbDoc.list1.id,'ListHook', ResponseHandler);
		trelloAPI.postWebhook(syncDbDoc.list2.id,'ListHook', ResponseHandler);
	},

	/**
	 * Simple gives a the found SyncList Document with the Callback back
	 * @param  {Function} callback Function who handles the data
	 */
	getAllSyncListFromDatabase : function(callback){
		syncList.find(function(err,data){
			callback(data);
		});
	},

	/**
	 * Stores the Connection between two Cards in the ListSync Doc in the Database
	 * @param  {object} DbDoc The Model Object which was hooked
	 */
	saveCardConnection : function(DbDoc,cardIDs,cardIDd){

		syncList.findById(DbDoc._id , function(err,list){
			if (err) console.log(err);
			
			// console.log('saveCardConnection between: '+DbDoc.listid1+" and "+DbDoc.listid2);
			list.cardsConnected.push( {
				card1: cardIDs,
				card2: cardIDd
			});
			// console.log(list);

			list.save(function(err,data){
				if (err) console.log(err);
				// console.log(data);
			});


		});
	},

	/**
	 * Searches in an Array for the Destination ID of a Synced Card
	 * @param  {array} ConCards Collection of Card-Sync-Obj
	 * @param  {string} oCardID  unique Trello Card ID
	 * @return {string}          unique Trello Card ID
	 */
	getDestinationCard : function(ConCards,oCardID){
		// console.log('getDestinationCard: '+ ConCards + "----" + oCardID);
		for(var i in ConCards){
			// console.log(ConCards[i].card1 + "vs." + oCardID);
			if (ConCards[i].card1 == oCardID){
				return ConCards[i].card2;
				break;
			}else if(ConCards[i].card2 == oCardID){
				return ConCards[i].card1;
				break;
			};
		}
	}
};

var trelloAPI = {

	callBackURL : 'http://ben-trello.webvariants.ninja/',
	actions  : {
		createCard : 'createCard',
		updateCard : 'updateCard',
		commentCard : 'commentCard'
	},
	
	/**	
	 * post a given ModelID-Webhook to Trello
	 * @param  {string} modelId ID of the Card, List or Board
	 * @return {boolean} true on good response else false
	 *  */
	postWebhook : function (modelId,modelType, callback) {
		console.log('postWebhook auf Model:'+modelType+ "mit Route: "+modelType);
		var webhookData = {
			idModel: modelId,
			callbackURL: this.callBackURL+modelType
		};

		if (typeof(callback)=='undefined') {
			var callback = function (id,res,bool) {}
		}

		t.post('/1/webhook/' , webhookData , function (r,d) {
			// console.log(r,'#',d);
			if (r.statusCode == 200 || r.statusCode == 304) {
				callback(modelId, r.responseBody, true);
			}else{
				callback(modelId, r.responseBody, false);
			};
		});
	},

	/**
	 * Handele a Trello-Card-Update-Request
	 * @param  {string} docID         The DB-Document ID for storing addtionaly data in
	 * @param  {Object} action        Trello Request Action Object (Part of the full Request)
	 * @param  {string} destinationID ID of the model(Card) where the update should be belongs to
	 */
	tunnelUpdateToDestCard : function(docID , action, destinationID) {

		var originCard = action.data.card;
		//Template for the Card-Objekt
		var newCard = {
			urlSource : null,
			idList : destinationID,
			due : null
		};

		switch(action.type){
			//On Create of a Card inside the hooked List -> Create a Copy of that
			case this.actions.createCard:
				newCard.idCardSource = originCard.id
				newCard.urlSource = "https://trello.com/c/"+originCard.id;
				t.post('/1/cards', newCard , function (r,d) {
					if (r) console.error(r);
						RoutingExp.saveCardConnection(docID , originCard.id , d.id);
				});
				break;
			//Card moved into synced List
			case this.actions.updateCard:
				newCard.idCardSource = originCard.id
				
				if (typeof(action.data.listAfter)!='undefined') {
					t.post('/1/cards', newCard , function (r,d) {
						if (r) console.error(r);
						RoutingExp.saveCardConnection(docID , originCard.id , d.id);
					});
				}else if(typeof(action.data.old)!='undefined'){
					var changeObj = {};

					for(var changeKey in action.data.old){
						changeObj[changeKey] = action.data.card[changeKey];
					}

					var destID = RoutingExp.getDestinationCard( docID.cardsConnected , originCard.id);

					t.put('/1/cards/'+destID, changeObj, function(err,data){
						if (err) console.error(err);
					})

				};
				break;
			//Comment incoming
			case this.actions.commentCard:

				var updateObj = {text:action.data.text};
				var destID    = RoutingExp.getDestinationCard( docID.cardsConnected , originCard.id);

				t.get('/1/cards/'+destID+'/actions', {filter:'commentCard', since: 'lastView' }, function(err,data){
					if (err) console.error(err);
					//if expression to avoid a inifty loop
					if (typeof(data[0])=='undefined' || data[0].data.text != action.data.text) {	
						t.post('/1/cards/'+destID+'/actions/comments', updateObj , function(err,data){
							if (err) console.error(err);
						});
					};
				})

				break;

		}
	},
};



module.exports = RoutingExp;