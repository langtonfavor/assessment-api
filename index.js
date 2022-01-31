const express = require("express");
const app = express();

const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const mongoose = require("mongoose");
const axios = require("axios");

//mongoose
mongoose.connect("mongodb://localhost:27017/example-data");
//expresss
app.use(cors());
app.use(express.json());

const populateData = async () => {
  let marksUJ = null;

  let namesUJ = null;

  let marksSU = null;

  let namesSU = null;

  await axios
    .get("https://registree-coding-challenge.glitch.me/UJ/marks")
    .then((res) => {
      // console.log(res.data);
      marksUJ = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  await axios
    .get("https://registree-coding-challenge.glitch.me/UJ/names")
    .then((res) => {
      // console.log(res.data);
      namesUJ = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  await axios
    .get("https://registree-coding-challenge.glitch.me/SU/marks")
    .then((res) => {
      // console.log(res.data);
      marksSU = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  await axios
    .get("https://registree-coding-challenge.glitch.me/SU/names")
    .then((res) => {
      // console.log(res.data);
      namesSU = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
  let combinedArray = [];
  if (marksUJ != null && namesUJ != null) {
    for (const [key, value] of Object.entries(namesUJ)) {
      if (namesUJ.hasOwnProperty(key) && marksUJ.hasOwnProperty(key)) {
        combinedArray.push({
          student_id: key,
          univeristy: "UJ",
          name: value,
          mark: marksUJ[key],
        });
      }
    }
  }

  if (marksSU != null && namesSU != null) {
    for (const [key, value] of Object.entries(namesSU)) {
      if (namesSU.hasOwnProperty(key) && marksSU.hasOwnProperty(key)) {
        combinedArray.push({
          student_id: key,
          univeristy: "SU",
          name: value,
          mark: marksSU[key],
        });
      }
    }
  }

  // console.log(combinedArray);
  // resp.send(combinedArray);
  return combinedArray;
};

// sorting

const sortByName = (results) => {
  console.log("running the first sort by name");
  let result = results.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });
  console.log(result);
  return result;
};

const sortByMarks = (results) => {
  let result = results.sort((a, b) => {
    if (a.mark < b.mark) {
      return -1;
    }
    if (a.mark > b.mark) {
      return 1;
    }

    return 0;
  });
  console.log(result);
  return result;
};

const sortByUniversity = (results) => {
  let result = results.sort((a, b) => {
    if (a.university < b.university) {
      return -1;
    }
    if (a.university > b.university) {
      return 1;
    }

    return 0;
  });
  console.log(result);
  return result;
};

// filtering...

const filterByName = (name, results) => {
  console.log("filetring by name");
  let filtered = results.filter((obj) => obj.name == name);
  return filtered;
};
const filterByMark = (mark, results) => {
  let filtered = results.filter((obj) => obj.mark == mark);
  return filtered;
};

const filterByUniversity = (university, results) => {
  let filtered = results.filter((obj) => obj.university == university);
  return filtered;
};

app.post("/raw", async (req, res) => {
  console.log("parameters");
  const { sort, filter } = req.body;

  let populatedData = await populateData();

  if (sort != null && sort.type != null) {
    if (sort.type == "name") {
      populatedData = sortByName(populatedData);
    }
  }

  if (sort != null && sort.type != null) {
    if (sort.type == "marks") {
      populatedData = sortByMarks(populatedData);
    }
  }

  if (sort != null && sort.type != null) {
    if (sort.type == "university") {
      populatedData = sortByUniversity(populatedData);
    }
  }

  if (filter != null && filter != {}) {
    console.log("inside filter");
    for (const [key, value] of Object.entries(filter)) {
      if (key == "name") {
        populatedData = filterByName(value, populatedData);
      }
      if (key == "marks") {
        populatedData = filterByMark(value, populatedData);
      }
      if (key == "university") {
        populatedData = filterByUniversity(value, populatedData);
      }
    }
  }

  if (populatedData.length == 0) {
    res.json("no data");
  } else {
    res.json(populatedData);
  }
});

app.post("/api/login", async (req, res) => {
  console.log(req.body);

  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      "supersecret"
    );

    return res.json({ status: "ok", user: token });
  } else {
    return res.json({ status: "error", user: "false" });
  }
});

app.post("/api/register", async (req, res) => {
  console.log(req.body);

  try {
    const user = await User.create({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
    });
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ status: "error", error: "check email" });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server up and running on port: ${PORT}`);
});
