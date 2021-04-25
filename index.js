const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb+srv://Group4:78@cluster0.rrqzp.mongodb.net/test";
const DATABASE_NAME = "Project";


var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var database, Driver, Out, Truck;

app.listen(5000, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        Driver = database.collection("Driver");
        Out = database.collection("IN/OUT");
        Truck = database.collection("Truck");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });

    app.get("/Driver/:firstName/:lastName", (request, response) => {
        Driver.findOne({ "firstName": request.params.firstName, "lastName": request.params.lastName }, (error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
    });

    app.get("/Truck/:DriverID", (request, response) => {
        Truck.findOne({ "driver": request.params.DriverID}, (error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
    });


    //not working right
    app.get("/Truck/:firstName/:lastName", (request, response) => {
        Driver.findOne({ "firstName": request.params.firstName, "lastName": request.params.lastName }, (error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            console.log("working");
            
            Truck.findOne({ "_id": new ObjectId(result._id) }, (error, theResult) => {
                if(error) {
                    return response.status(500).send(error);
                }
                result = theResult;
            });
            response.send(result);
        });
    });
});


