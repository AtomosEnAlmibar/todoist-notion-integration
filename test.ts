const { TodoistApi } = require("@doist/todoist-api-typescript");
const dotenv = require("dotenv");
const { Client } = require("@notionhq/client")

dotenv.config();


//#region Todoist
const api = new TodoistApi(process.env.TODOIST_TOKEN);

const getCustomTasks = (filter) => {
  return new Promise((resolve, reject) => {
    api
      .getTasks({
        filter: filter
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
//#endregion

//#region Notion
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

const getUsers = async () => {
    const listUsersResponse = await notion.users.list({})
    console.log(listUsersResponse);
}
//#endregion

async function main() {
    try {
        const customTaskResult = await getCustomTasks("@Diario");
        //console.log(customTaskResult); 


    } catch (error) {
        console.log(error);
    }
}

main();