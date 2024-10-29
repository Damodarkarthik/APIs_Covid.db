const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3002, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

//API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `select * from state;`;
  const getStates = await database.all(getStatesQuery);

  response.send(
    getStates.map((eachState) =>
      convertStateDbObjectToResponseObject(eachState)
    )
  );
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `select * from state where state_id = ${stateId};`;
  const getStates = await database.get(getStatesQuery);
  response.send(getStates);
});

//API 3
app.post("/districts/", async (request, response) => {
  const districtsDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtsDetails;
  const addDistrictsQuery = `insert into district(district_name, state_id, cases,cured,deaths) values('${districtName}', ${stateId},${cases}, ${cured}, ${deaths});`;
  await database.run(addDistrictsQuery);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `select * from district where district_id = ${districtId}`;
  const getDistrict = await database.get(getDistrictQuery);
  response.send(getDistrict);
});

//API 5

app.get("/districts/", async (req, response) => {
  const getDistrictsQuery = `select * from district ;`;
  const getDistrict = await database.all(getDistrictsQuery);
  response.send(getDistrict);
});

//API 6
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
  DELETE FROM
    district
  WHERE
    district_id = ${districtId}; 
  `;
  await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 7
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictDetailsQuery = `UPDATE
    district
  SET
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active}, 
    deaths = ${deaths}
  WHERE
    district_id = ${districtId};
  `;
  await database.run(updateDistrictDetailsQuery);
  response.send("District details updated");
});

//API 8
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const stateStatsQuery = `select sum(cases) as totalCases, sum(cured) as totalCured, sum(active) as totalActive, sum(deaths) as totalDeaths from district where state_id = ${stateId};`;
  const stateDetails = await database.all(stateStatsQuery);
  response.send(stateDetails);
});

//API 9
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateDetailsQuery = `SELECT 
    state.state_name
FROM 
    district
JOIN 
    state ON district.state_id = state.state_id
WHERE 
    district.district_id = ${districtId};
`;
  const getStateName = await database.all(stateDetailsQuery);
  response.send({ stateName: getStateName[0].state_name });
});
