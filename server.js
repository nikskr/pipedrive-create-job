const express = require("express");
const pipedrive = require("pipedrive");
const session = require("express-session");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const path = require("path");

const apiClient = new pipedrive.ApiClient();
const secretKey = crypto.randomBytes(64).toString("hex");

const app = express();
const PORT = process.env.PORT || 3000;

const apiToken = "23bdbcef1995604205516cd404b0403c42b3c722";
const companyDomain = "none-sandbox6";

function formKeyToFieldKey(formKey) {
  switch (formKey) {
    case "address":
      return "Address";
    case "area":
      return "Area";
    case "city":
      return "City";
    case "date":
      return "Start date";
    case "email":
      return "Email";
    case "endTime":
      return "End time";
    case "firstName":
      return "First name";
    case "jobDescription":
      return "Job description";
    case "jobSource":
      return "Job source";
    case "jobType":
      return "Job type";
    case "lastName":
      return "Last name";
    case "phone":
      return "Phone";
    case "responsiblePerson":
      return "Responsible person";
    case "startTime":
      return "Start time";
    case "state":
      return "State";
    case "zipeCode":
      return "Zip code";
    default:
      return "Unexpected form field";
  }
}

async function updatingCustomFieldValue(data) {
  try {
    console.log("Sending request...");

    const DEAL_ID = 4;
    const fieldsApi = new pipedrive.DealFieldsApi(apiClient);
    const dealsApi = new pipedrive.DealsApi(apiClient);

    const dealFields = await fieldsApi.getDealFields();
    for (let key in data) {
      console.log(key, data[key]);
      const appointedField = dealFields.data.find(
        (field) => field.name === formKeyToFieldKey(key)
      );
      console.log(appointedField);
      await dealsApi.updateDeal(DEAL_ID, {
        [appointedField.key]: data[key],
      });
    }
  } catch (err) {
    const errorToLog = err.context?.body || err;
    console.log("Updating failed", errorToLog);
  }
}

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

apiClient.authentications.api_key.apiKey = apiToken;

let oauth2 = apiClient.authentications.oauth2;
oauth2.clientId = "787d02207c7ec66c";
oauth2.clientSecret = "3066ea31f3f21a199a50ce1140343e7f72ddaa83";
oauth2.redirectUri = `https://35da-134-17-188-198.ngrok-free.app/callback`;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  if (
    req.session.accessToken !== null &&
    req.session.accessToken !== undefined
  ) {
    res.redirect(__dirname + "/");
  } else {
    const authUrl = apiClient.buildAuthorizationUrl();
    res.redirect(authUrl);
  }
});

app.get("/callback", (req, res) => {
  console.log("callback start");
  const authCode = req.query.code;
  console.log(req.query.code);
  console.log("Authcode:", authCode);

  const promise = apiClient.authorize(authCode);

  promise.then(
    () => {
      req.session.accessToken = apiClient.authentications.oauth2.accessToken;
      console.log("auth success");
      res.redirect("to-settings");
    },
    (exception) => {
      console.log("Error of code-token exchange: ", exception.message);
    }
  );
});

app.use(bodyParser.json());

app.post("/form-handler", (req, res) => {
  console.log(req.body);
  updatingCustomFieldValue(req.body);
  res.status(200).send({ message: "ok" });
});

app.use("/to-settings", (_, res) => {
  res.redirect(
    `https://${companyDomain}.pipedrive.com/settings/marketplace/app/${oauth2.clientId}/app-settings`
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
