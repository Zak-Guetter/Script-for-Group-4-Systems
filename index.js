const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const { request } = require("express");
const CONNECTION_URL = "mongodb+srv://Group4:78@cluster0.rrqzp.mongodb.net/test";
const DATABASE_NAME = "Project";


var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var database, Driver, Out, Truck;

app.listen(5000, () => {
    //conects to mongo client and connects to the database "Project" and the collections inside
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

    //gets the driver by first and last name
    app.get("/Driver/:firstName/:lastName", (request, response) => {
        Driver.findOne({ "firstName": request.params.firstName, "lastName": request.params.lastName }, (error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
    });

    //gets the truck by driver ID
    app.get("/Truck/:DriverID", (request, response) => {
        Truck.findOne({ "driver": request.params.DriverID}, (error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
    });


    //gets the Truck object by using the drivers first and last name
    app.get("/Truck/:firstName/:lastName", (request, response) => {
        let something = "";
        Driver.findOne({ "firstName": request.params.firstName, "lastName": request.params.lastName }, (error, result) => {
            if(error) {
                return response.status(500).send(error);
            }
                       
            something = result;
        });
        setTimeout(() => {
            Truck.findOne({ "driver": something._id.toHexString()}, (error, result) => {
                if(error) {
                    return response.status(500).send(error);
                }
                response.send(result);
            });
        }, 100);
    });

    app.get("/Driver/Get", async(request, response) => {
        let data = await Driver.find().toArray();
        response.send(data);
    });


    



});


