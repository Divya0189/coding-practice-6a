const express = require("express");
const {open} = require("sqlite");

const path = require("path");
const sqlite3 = require("sqlite3");

const app= express();
app.use(express.json());

const dbPath = path.join(__dirname, 'covid19India.db');

let database = null;

const initializeDBAndServer = async () => {
    try{
        database = await open({
            filename : dbPath,
            driver : sqlite3.Database,
    })
        app.listen(3000);
    } catch (e) => {
        console.log(`DB Error : ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

const convertStateTable = (object) => {
    return {
        stateId :object.state_id,
        stateName : object.state_name,
        population : object.population,
    };
};

const convertDistrictTable = (object) => {
    return {
        districtId : object.district_id,
        districtName : object.districtName,
        stateId : object.state_id,
        cases : object.cases,
        cured : object.cured,
        active : object.active,
        deaths : objectdeaths,
    };
};

const convertSingleDistrictTable = (object) => {
    return {
        totalCases : object.cases,
        totalCured : object.cured,
        totalActive : object.active,
        totalDeaths : object.deaths,
    };
};

app.get("/states/", async(request, response) => {
    const getStateQuery = `
      SELECT 
        * 
      FROM 
        state`;
    const statesArray = await database.all(getStateQuery);
    response.send(statesArray.map((eachArray) =>convertStateTable(eachArray)));
});

app.get("/states/:stateId/", async(request, response) => {
    const {stateId} = request.params;
    const getStateQuery = `
    SELECT
      *
    FROM
      state
    WHERE
      state_id = ${stateId};`;
    const stateArray = await database.get(getStateQuery);
    response.send(convertStateTable(stateArray));
});

app.post("/districts/", async (request, response) => {
    const {districtName, stateId, cases, cured, active, deaths} = request.body;
    const addDistrictQuery = `
       INSERT INTO
         district(district_name, state_id, cases, cured, active, deaths)
        VALUES(
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths});`;
    await database.run(addDistrictQuery);
    response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
    const {districtId} = request.params;
    const getDistrictQuery = `
        SELECT 
          *
        FROM
          district
        WHERE
          district_Id = ${districtId};`;
    const districtArray = await database.get(getDistrictQuery);
    response.send(convertDistrictTable(districtArray));
});

app.delete("/districts/:districtId/", async (request, response) => {
    const {districtId} = request.params;
    const deleteDistrictQuery = `
      DELETE FROM 
        district 
      WHERE 
        district_id = ${districtId};`;
    const districtArray = await database.run(deleteDistrictQuery);
    response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
    const {districtId} = request.params;
    const {districtName, stateId, cases, cured, active, deaths} = request.body;
    const updateDistrictQuery = `
    UPDATE 
      district
    SET
        district_name ='${districtName}',
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths = ${deaths};`;
    await database.run(updateDistrictQuery);
    response.send("District Details Updated");
});


app.get("/states/:stateId/stats/", async (request, response) => {
    const {stateId} = request.params;
    const getStateQuery = `
        SELECT 
            SUM(cases) AS cases,
            SUM(cured) AS cured,
            SUM(active) AS active,
            SUM(deaths) AS deaths
        FROM 
            district
        WHERE
            state_id = ${stateId};`;
    const stateArray = await database.get(getStateQuery);
    response.send(convertSingleDistrictTable(stateArray));
});

app.get("/districts/:districtId/details/", async(request, response) =>{
    const {districtId} = request.params;
    const getDetailsQuery = `
    SELECT 
        state_name
    FROM 
        state INNER JOIN district 
    ON state.state_id = district.state_id
    WHERE 
        district.state_id = ${districtId};`;
    const detailsArray = await database.get(getDetailsQuery);
    response.send({stateName :detailsArray.state_name})
});

module.exports = app;







