const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const { request } = require("express");
const CONNECTION_URL = "mongodb+srv://admin:admin@cluster0.rrqzp.mongodb.net/test";
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

    
    //get all driver
    app.get("/Driver", async(request, response) => {
        let data = await Driver.find().toArray();
        response.send(data);
    });

    //get all truck
    app.get("/Truck", async(request, response) => {
        let data = await Truck.find().toArray();
        response.send(data);
    });

    //get all out
    app.get("/Out", async(request, response) => {
        let data = await Out.find().toArray();
        response.send(data);
    });

    //update Truck with new driver
    app.get("/Update/Truck/:id/:newDriver", (request, response)=>{
        Truck.updateOne({"_id": ObjectId.createFromHexString(request.params.id)}, {$set: { driver : request.params.newDriver}}, function(err, res){
            if(err) throw err;
        });
    });


    //update Truck with new mileage

    app.get("/Update/TruckMiles/:id/:miles/:maint", (request, response)=>{
        let theTruck;

        setTimeout(() => {
            theTruck = Truck.findOne({"_id": ObjectId.createFromHexString(request.params.id)}, (error, result) => {
                if(error) {
                    return response.status(500).send(error);
                }
                response.send(result);
            });
        }, 100);

        if(theTruck.untilMaint - (request.params.miles - theTruck.miles)  <= 0 && theTruck.size == "Full Sleeper")
        {
            theTruck.untilMaint = (theTruck.untilMaint - (request.params.miles - theTruck.miles)) + 20000;
        }
        else if(theTruck.untilMaint - (request.params.miles - theTruck.miles)  <= 0 && theTruck.size == "Single Cab")
        {
            theTruck.untilMaint = (theTruck.untilMaint - (request.params.miles - theTruck.miles)) + 25000;
        }
        else if(theTruck.untilMaint - (request.params.miles - theTruck.miles)  <= 0 && theTruck.size == "Single Axle")
        {
            theTruck.untilMaint = (theTruck.untilMaint - (request.params.miles - theTruck.miles)) + 15000;
        }
        else{
            response.send("Error!");
        }

        Truck.updateOne({"_id": ObjectId.createFromHexString(request.params.id)}, {$set: { miles: request.params.miles, untilMaint: theTruck.untilMaint}}, function(err, res){
            if(err) throw err;
        });
    });
    

    //Delete Truck
    app.get("/Delete/:id", (request, response)=>{
        Truck.deleteOne({"_id": ObjectId.createFromHexString(request.params.id), function(err, obj) 
            {
                if (err) console.log(err);
                response.send(obj);
            }
        });
    });

    //delete Driver
    app.get("/Delete/Driver/:id", (request, response)=>{
        Driver.deleteOne({"_id": ObjectId.createFromHexString(request.params.id), function(err, obj) 
            {
                if (err) console.log(err);
                response.send(obj);
            }
            
        });
    });

    //delete Driver
    app.get("/Delete/Out/:id", (request, response)=>{
        Out.deleteOne({"_id": ObjectId.createFromHexString(request.params.id), function(err, obj) 
            {
                if (err) console.log(err);
                response.send(obj);
            }
            
        });
    });

    //new Driver
    app.get("/New/Driver/:firstName/:lastName/:phoneNumber", (request, response)=>{

        Driver.insertOne({firstName : request.params.firstName, lastName: request.params.lastName, phoneNumber: request.params.phoneNumber}, function(err, res) {
            if (err) throw err;
        });
    });

    //new OUT
    app.get("/New/Out/:truckID/:status/:mileage/:driverID", (request, response)=>{
        Out.insertOne({truckID: request.params.truckID, status: request.params.status, mileage: request.params.mileage, date: new Date(Date.now()).toISOString(), driver: request.params.driverID}, function(err, res) {
            if (err) throw err;
        });
    });

    //new Truck
    app.get("/New/Truck/:driver/:size/:truckDesc/:miles/:DOT/:untilMaint", (request, response)=>{
        Out.insertOne({driver: request.params.driver, size: request.params.size, truckDesc: request.params.truckDesc, miles: request.parms.miles, DOT: request.params.DOT, untilMaint: request.params.untilMaint}, function(err, res) {
            if (err) throw err;
        });
    });


    //Update all of Truck
    app.get("/Update/allTruck/:id/:driver/:size/:truckDesc/:miles/:DOT/:untilMaint", (request, response)=>{
        Truck.updateOne({"_id": ObjectId.createFromHexString(request.params.id)}, {$set: 
            { 
                driver : request.params.newDriver,
                size : request.parms.size,
                truckDesc : request.params.truckDesc,
                miles: request.params.miles,
                DOT: request.params.DOT,
                untilMaint: request.params.untilMaint
            }
        }, function(err, res){
            if(err) throw err;
        });
    });

    //update all of Driver
    app.get("/Update/allDriver/:id/:first/:last/:phone", (request, response)=>{
        Driver.updateOne({"_id": ObjectId.createFromHexString(request.params.id)}, {$set: 
            { 
                firstName : request.params.first,
                lastName : request.params.lastName,
                phoneNumber : request.params.phoneNumber
            }
        }, function(err, res){
            if(err) throw err;
        });
    });


    //update all of in/out
    app.get("/Update/allOut/:id/:truckID/:status/:mileage/:date/:driverID", (request, response)=>{
        Out.updateOne({"_id": ObjectId.createFromHexString(request.params.id)}, {$set: 
            { 
                truckID : request.params.truckID,
                status: request.params.status,
                mileage: request.params.mileage,
                date: request.params.date,
                driver: request.params.driverID,
            }
        }, function(err, res){
            if(err) throw err;
        });
    });




    
    



});


