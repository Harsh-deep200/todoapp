const express = require(`express`);
const session = require("express-session");
const fs = require(`fs`);
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const db = require("./modal/db");
const User = require("./modal/user");
const data = require("./modal/data");
const dotenv = require("dotenv");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    let fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// app.use(upload.single("ProfilePic"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

app.use(express.json());

// app.use(express.json());
app.use(express.urlencoded({ extended: "true" }));

app.use(express.static("public"));

//set the view engine to ejs
app.set("view engine", "ejs");

//set the path for views
app.set("views", __dirname + "/views");

dotenv.config({ path: "./.env" });

let tasks;

findtasks();

async function findtasks() {
  tasks = await data.find();
}
console.log(tasks);

/* let tasks = [];
const todoFilePath = "./tasks.json";

//exitsSync return true if the filename or path that we give it to its argument exists otherwise false
if (fs.existsSync(todoFilePath)) {
  // In fs.readFile() method, we can read a file in a non-blocking asynchronous way, but in the fs.readFileSync() method, we can read files in
  // a synchronous way, i.e. we are telling node.js to block other parallel processes and do the current file reading process. That
  // is, when the fs.readFileSync() method is called the original node program stops executing, and the node waits for the fs.readFileSync()
  // function to get executed, after getting the result of the method the remaining node program is executed.
  const data = fs.readFileSync(todoFilePath, "utf8");
  tasks = JSON.parse(data);
}

// Save tasks to the JSON file
function saveTasksToFile() {
  fs.writeFileSync(todoFilePath, JSON.stringify(tasks), "utf8");
} */

// Routes
app.use(express.static("public"));

app.get("/", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render("login", { error: null, saved: null });
  }
  const username = req.session.username;
  res.render("index", { username });
});

app.get("/home", (req, res) => {
  res.redirect("/");
});

app.get("/contact", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render("login", { error: null, saved: null });
  }
  const username = req.session.username;
  res.render("contact", { username });
});

app.get("/todo", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render("login", { error: null, saved: null });
  }
  const username = req.session.username;
  res.render("todo", { username, tasks });
});

app.get("/about", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render("login"), { error: null, saved: null };
  }
  const username = req.session.username;
  res.render("about", { username });
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and Password are required" });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.render("login", {
      error: "invalid user and password",
      saved: null,
    });
  }

  if (user.password != password) {
    return res.render("login", {
      error: "invalid password",
      saved: null,
    });
  }

  req.session.username = username;
  req.session.isLoggedIn = true;
  res.render("index", { username });

  /* fs.readFile(__dirname + "/credentials.json", "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading the credentials file: ${err}`);
      return res.status(500).json({ error: "Internal server error" });
    }

    let credentials = [];

    if (data.length === 0) {
      credentials = "[]";
    }

    try {
      credentials = JSON.parse(data);
    } catch (error) {
      console.error(`Error parsing the credentials file: ${error}`);
      return res.status(500).json({ error: "Internal server error" });
    }

    const matchedCredentials = credentials[username];
    // console.log(matchedCredentials);
    if (!matchedCredentials) {
      return res.render("login", {
        error: "invalid user and password",
        saved: null,
      });
    }
    if (matchedCredentials) {
      req.session.username = username;
      req.session.isLoggedIn = true;
      res.render("index", { username });
    }
  }); */

  /* if (username == "h" && password == "h") {
    req.session.username = username;
    req.session.isLoggedIn = true;

    // console.log(username, password);

    return res.redirect("/");
  }

  return res.render("login", {
    error: "invalid user and password",
    saved: null,
  }); */
});

app.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect("/login");
});

app.post("/signup", async (req, res) => {
  const username = req.body.newUsername;
  const password = req.body.newPassword;
  // console.log(username, password);

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "username and password are required" });
  }

  const userexists = await User.findOne({ username });

  if (userexists) {
    res.render("login", { error: null, saved: "user already exists" });
    return;
  }

  const user = new User({
    username: username,
    password: password,
  });

  user.save().then(() => {
    console.log(`credentials for ${username} saved succesfully`);
  });

  return res.render("login", {
    error: null,
    saved: "credentials are saved successfully",
  });

  /* fs.readFile(__dirname + "/credentials.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the credentials file:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    let credentials = {};

    try {
      credentials = JSON.parse(data);
    } catch (error) {
      console.error("Error parsing the credentials file:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const userexists = credentials.hasOwnProperty(username);

    if (userexists) {
      res.render("login", { error: null, saved: "user already exists" });
      // res.redirect("/login");
      return;
    } else {
      //Add the new credentials
      credentials[username] = password;

      fs.writeFile("./credentials.json", JSON.stringify(credentials), (err) => {
        if (err) {
          console.error("Error saving the credentials", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        console.log(`credentials for ${username} saved succesfully`);
      });

      return res.render("login", {
        error: null,
        saved: "credentials are saved successfully",
      });
    }
  }); */

  // res.redirect("/");
});

app.get("/signUp", (req, res) => {
  res.render("login", { error: null, saved: null });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null, saved: null });
});

app.get("/styles.css", (req, res) => {
  res.sendFile(__dirname + "/styles.css");
});

db.init()
  .then(() => {
    console.log("db connected");

    app.listen(3000, () => {
      console.log(`server is listening on port no.3000`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.post("/addTask", upload.single("photo"), async (req, res) => {
  const task = req.body.task;
  const photo = req.file ? req.file.filename : null;

  const newTask = new data({
    task: task,
    photo: photo,
  });

  await newTask.save();

  /* const id = uuidv4(); // Generate a unique ID for the task
  tasks.push({ id, task, photo });
  saveTasksToFile();
  // const username = req.session.username;
  // res.render("todo", { username, tasks }); */
  res.redirect("/todo");
});

app.get("/edit/:id", (req, res) => {
  //   console.log(req);
  const taskId = req.params.id;
  const task = tasks.find((task) => task.id === taskId);
  if (!task) {
    res.status(404).send("Task not found");
  } else {
    res.render("edit", { task });
  }
});

app.post("/edit/:id", upload.single("photo"), (req, res) => {
  const taskId = req.params.id;
  const task = tasks.find((task) => task.id === taskId);
  if (!task) {
    res.status(404).send("Task not found");
  } else {
    task.task = req.body.task;
    if (req.file) {
      task.photo = req.file.filename;
    }
    saveTasksToFile();
    // const username = req.session.username;
    // res.render("todo", { username, tasks });
    res.redirect("/todo");
  }
});

app.get("/delete/:id", (req, res) => {
  const taskId = req.params.id;
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasksToFile();
  // const username = req.session.username;
  // res.render("todo", { username, tasks });
  res.redirect("/todo");
});
