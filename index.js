const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const reference = admin.database();
 // Create and Deploy Your First Cloud Functions
 // https://firebase.google.com/docs/functions/write-firebase-functions

//Sends like new notifications
exports.newLikeNotification = functions.database.ref('/Likes/{storyId}/{pushId}')
    .onCreate(event =>{
  		    const like = event.data.val();
  				const user = like.user;
  				const title = like.postTitle;

				   var payload = {
               notification: {
                title: "New Like",
                body: user + " liked " + title,
                sound: "default"
              }
           };

          const options = {
               priority: "high",
               timeToLive: 604800
           };

          return admin.messaging().sendToTopic("newPost",payload,options)
            .then(function (response){
              console.log("Message sent...! ")
            })
          .catch(function (error){
              console.log("Failed ",error);
          });
  });

//Sends comment new notifications
exports.commentNotification = functions.database.ref('/Comments/{storyId}/{pushId}')
   .onCreate(event =>{
 		    const comment = event.data.val();
 				const author = comment.author;
 				const text = comment.commentText;
 				var storyTitle

 				return id.then(reference.ref('Stories').child(event.params.storyId).child('title').once('value')
         .then(snap => {
           var payload = {
                notification: {
                 title: author + " commented on " + storyTitle,
                 body: text,
                 sound: "default"
               }
             };

             const options = {
                priority: "high",
                timeToLive: 604800
            };

             return admin.messaging().sendToTopic("newPost",payload,options)
               .then(function (response){
                 console.log("Message sent...! " + storyTitle)
               })
             .catch(function (error){
                 console.log("Failed ",error);
             });
   			}).catch(reason => {
 						 console.log("Story title not found ",reason);
 				 }));
 });

//Sends notifications when new poem is added
exports.newPoemNotification = functions.database.ref('Poems/{postId}')
  .onCreate(event =>{
      const poem = event.data.val();
  		const title = poem.title;
  		const author = poem.author
      var payload = {
        notification: {
          title: "New Poem",
          body: "Read " + title + " by " + author,
  				sound: "default"
        }
      };

  		const options = {
  			 priority: "high",
  			 timeToLive: 604800
       };

      return admin.messaging().sendToTopic("newPost",payload,options)
        .then(function (response){
          console.log("Message sent...!")
        })
      .catch(function (error){
          console.log("Failed ",error);
      });
});

//Sends notifications when new devotion is added
exports.newDevotionNotification = functions.database.ref('Devotions/{postId}')
  .onCreate(event =>{
      const devotion = event.data.val();
  		const title = devotion.title;
  		const author = devotion.author
      var payload = {
        notification: {
          title: "New Devotion",
          body: "Read " + title + " by " + author,
  				sound: "default"
        }
      };

  		const options = {
  			 priority: "high",
  			 timeToLive: 604800
  	 };

      return admin.messaging().sendToTopic("newPost",payload,options)
        .then(function (response){
          console.log("Message sent...!")
        })
      .catch(function (error){
          console.log("Failed ",error);
      });
});

//Sends notifications to all users when new story is added
exports.newStoryNotification = functions.database.ref('Stories/{postId}')
  .onCreate(event =>{
      const story = event.data.val();
      const title = story.title;
      const genre = story.category;
      const author = story.author
      var payload = {
        notification: {
          title: "New (" + genre + ") Story",
          body: "Read " + title + " by " + author,
          sound: "default"
        }
      };

      const options = {
         priority: "high",
         timeToLive: 604800
     };

      return admin.messaging().sendToTopic("newPost",payload,options)
        .then(function (response){
          console.log("Message sent...!")
        })
      .catch(function(error){
          console.log("Failed ",error);
      });
});

//Sends new CHAPTER notifications
exports.newChapterNotification = functions.database.ref('/Chapters/{storyId}/{pushId}')
  .onWrite(event =>{
		  if (event.data.previous.numChildren() < event.data.numChildren()) {
    	    //Added chapter
          const chapter = event.data.val();
    			const chapterNumber = chapter.chapterTitle;

          const id = chapterCount(event.params.storyId)

    			return id.then(reference.ref('Stories').child(event.params.storyId).child('title').once('value')
          .then(snap => {
            var payload = {
              notification: {
               title: "New chapter: " + snap.val(),
               body: "Chapter " + chapterNumber + " added: " + snap.val(),
               sound: "default"
             }
           };

           const options = {
              priority: "high",
              timeToLive: 604800
          };

           return admin.messaging().sendToTopic("newPost",payload,options)
             .then(function (response){
               console.log("Message sent...! " + storyTitle)
             })
           .catch(function (error){
               console.log("Failed ",error);
           });
            console.log("Story title  " + snap.val());
  			}).catch(reason => {
						 console.log("Story title not found ",reason);
				 }));
		  } else if (event.data.previous.numChildren() > event.data.numChildren()) {
    		//Deleted chapter
    		const count = reference.ref('Stories').child(event.params.storyId).child('chapters').transaction(function(currentValue) {
    			return currentValue - 1
    		 });
    	}  else{
				return null;
			}
});

//Counts the number of chapters for a particular story
function chapterCount(id){
    //Added chapter
    const timeUpdated = reference.ref('Stories').child(id).child('lastUpdate').set(admin.database.ServerValue.TIMESTAMP)
    return timeUpdated.then(reference.ref('Stories').child(id).child('chapters').transaction(function(currentValue) {
      return currentValue + 1
    }));
}
