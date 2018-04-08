// not used anymore

class MongoDB {
  constructor() {
    this.mongoClient = require('mongodb').MongoClient;
    this.test = require('assert');
    this.url = "https://mongodb://nodeapplicationuser:Pollo1993?@ds113925.mlab.com:13925/nodechatapp";
  }

  connect() {
    this.mongoClient.connect(this.url, function(err, db) {
      var collection = db.collection("messages");
      collection.insertOne( { content: 'Hello!!' } );

      setTimeout(function() {

          // Fetch the document
          collection.findOne({hello:'world_no_safe'}, function(err, item) {
            test.equal(null, err);
            test.equal('world_no_safe', item.hello);
            db.close();
          })
        }, 100);

    });
  }
}

exports.MongoDB = MongoDB
