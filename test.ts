const todoistApi = require("@doist/todoist-api-typescript");
const dotenv = require("dotenv");

dotenv.config();

const api = new todoistApi.TodoistApi(process.env.TODOIST_TOKEN)

api.getLabels()
    .then((labels) => {
        labels.forEach(label => {
            console.log(label.name);
        });
    })
    .catch((error) => console.log(error))

