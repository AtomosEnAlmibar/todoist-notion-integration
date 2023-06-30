const { TodoistApi } = require("@doist/todoist-api-typescript");
const { Client } = require("@notionhq/client")
const dotenv = require("dotenv");

dotenv.config();


//#region Todoist
const todoistApi = new TodoistApi(process.env.TODOIST_TOKEN);

const getProjects = () => {
  return new Promise((resolve, reject) => {
    todoistApi
      .getProjects()
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getCustomTasks = (filter) => {
  return new Promise((resolve, reject) => {
    todoistApi
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
const notionApi = new Client({
    auth: process.env.NOTION_TOKEN,
})

const appendBlock = (async (taskBlock) => {
  const blockId = 'bce62cf4-7d76-4eb5-8f23-8c09275313aa';
  const response = await notionApi.blocks.children.append({
    block_id: blockId,
    children: [
      taskBlock
    ]
  });
  console.log(response);
})
//#endregion

async function main() {
    try {
        const projects = await getProjects();
        const dailyTasks = await getCustomTasks("@Diario");
        dailyTasks.forEach(dailyTask => {          
          let tags = setTagOfTask(dailyTask);
          let priority = setPriorityOfTask(dailyTask);
          let content = setContentOfTask(dailyTask)
          let type = setTypeOfTask(dailyTask);
          let project = setProject(dailyTask, projects);
          let priorityText =
            {
              "type": "text",
              "text": {
                "content": priority
              },
              "annotations": {
                "bold": true,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              }
            };
          let projectText =
            {
              "type": "text",
              "text": {
                "content": project
              },
              "annotations": {
                "bold": true,
                "italic": true,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              }
            };
          let taskBlock = 
            {
              "object": "block",
              "type": type,
              [type]: {
                "rich_text": [
                  projectText,
                  priorityText,
                  {
                    "type": "text",
                    "text": {
                      "content": content,
                    }
                  },
                ],
                "color": tags,
              }
            }

            const ass = appendBlock(taskBlock);
        });

    } catch (error) {
        console.log(error);
    }
}

main();

const setTagOfTask = (task) => {
  const tags = {
    'blue_background'   : [ 'Personal', 'Gym', 'Viajes' ],
    'green_background'  : [ 'Anime', 'Gunpla', 'Videojuegos' ],
    'yellow_background' : [ 'Programación', 'UX/UI', 'Idiomas' ]
  }

  for (const key in tags) {
    const values = tags[key];
    const found = values.find(value => task.labels.includes(value));
    if (found) {
      return key;
    }
  }
}

const setProject = (task, projects) => {
  let projectName = '';
  let maxLength = 12;
  projects.forEach(project => {
    if (task.projectId === project.id) {
      projectName = '  (' + project.name + ')';
      for (let i = projectName.length; i < maxLength; i++) {
        projectName += ' ';
      }
      return projectName;
    }
  });
  return projectName;
};

const setPriorityOfTask = (task) => {
  const priority = {
    1 : '    ',
    2 : '!   ',
    3 : '!!  ',
    4 : '!!! ',
  }

  return priority[task.priority];
}

const setContentOfTask = (task) => {
  return task.content;
}

const setTypeOfTask = (task) => {
  const typesOfTask = {
    'Tarea'  : 'bulleted_list_item',
    'Evento' : 'to_do',
    'Nota'   : 'toggle'
  }

  for (const key in typesOfTask) {
    if (task.labels.includes(key)) {
      return typesOfTask[key];
    }
  }
}