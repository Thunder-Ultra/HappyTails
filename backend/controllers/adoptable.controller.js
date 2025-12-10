const Adoptable = require("./../models/adoptable.model");

async function addAdoptable(req, res) {
  // 1. Check Auth
  const userId = res.locals.userId || (req.user && req.user.id);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID not found." });
  }

  // 2. Process Files (Multer puts them in req.files)
  let imageFilenames = [];
  if (req.files && req.files.length > 0) {
    imageFilenames = req.files.map((file) => file.filename);
  }

  // 3. Create Model Instance
  // Note: req.body contains the text fields sent via FormData
  const newAdoptable = new Adoptable({
    caretaker_id: userId,
    name: req.body.name,
    age: req.body.age,
    weight: req.body.weight,
    height: req.body.height,
    breed: req.body.breed,
    type: req.body.type,
    vaccinated: req.body.vaccinated, // "Yes" or "No" string or boolean
    address: req.body.address,
    description: req.body.description,
    images: imageFilenames, // Pass the array of filenames we extracted above
  });

  try {
    await newAdoptable.save();
    res.status(201).json({ message: "Adoptable added successfully!" });
  } catch (err) {
    console.error("Error adding adoptable:", err);
    res.status(500).json({ message: "Failed to add adoptable." });
  }
}

async function getMyAdoptables(req, res) {
  try {
    // 1. Validate that we have the User ID from the Auth Middleware
    // Note: You used 'res.locals.userId' in your snippet, so we rely on that.
    // If your auth middleware uses 'req.user.id', change this line accordingly.
    const userId = res.locals.userId || (req.user && req.user.id);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });
    }

    // 2. Call the Model
    const result = await Adoptable.getMyAdoptablesByCaretakerId(userId);

    // 3. Send Response
    // (The model already formats the images and structure, so we just send it)
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching user adoptables:", err);
    res.status(500).json({
      message: "Failed to fetch your adoptables. Please try again later.",
    });
  }
}

async function getAdoptables(req, res) {
  let { page = 1, limit = 20, search = "" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const result = await Adoptable.getAdoptablesInPages(page, limit, search);

  // console.log(result);

  res.json(result);
}

async function getAdoptable(req, res) {
  try {
    const petId = req.params.id;
    if (!petId) {
      res.status(404).json();
    }
    result = await Adoptable.findById(petId);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
}

// async function updateAdoptable(req, res) {
//   const userId = res.locals.userId;
//   const petId = req.params.id;
//   const updatedPetDetails = req.body;

//   console.log(updatedPetDetails);
//   console.log(req.files);
//   // Send a dummy Success Message
//   res.json({ msg: "Update Successfull" });
// }

// async function updateAdoptable(req, res) {
//   const userId = res.locals.userId || (req.user && req.user.id);
//   const petId = req.params.id;

//   try {
//     // 1. Process New Images (if any uploaded)
//     let newImageFilenames = [];
//     if (req.files && req.files.length > 0) {
//       newImageFilenames = req.files.map((file) => file.filename);
//     }

//     // 2. Prepare Update Data
//     // We merge the body text fields with the new image array
//     const updateData = {
//       ...req.body,
//       newImages: newImageFilenames, // Only contains NEW files
//     };

//     // 3. Call Model to handle the DB logic
//     // We pass userId to ensure only the owner can update
//     // const existingPet = new Pet(updateData)
//     const result = await Adoptable.updateById(petId, userId, updateData);

//     if (!result) {
//       return res
//         .status(404)
//         .json({ message: "Pet not found or unauthorized." });
//     }

//     res.json({ message: "Update Successful!", petId: petId });
//   } catch (err) {
//     console.error("Error updating adoptable:", err);
//     res.status(500).json({ message: "Failed to update adoptable." });
//   }
// }

async function updateAdoptable(req, res) {
  // 1. Get IDs
  const userId = res.locals.userId || (req.user && req.user.id);
  const petId = req.params.id;

  try {
    // 2. Process New Images (from Multer)
    let newImageFilenames = [];
    if (req.files && req.files.length > 0) {
      newImageFilenames = req.files.map((file) => file.filename);
    }

    // 3. Prepare Data Object
    // We combine the ID, Owner ID, Text Fields, and New Images
    const adoptableData = {
      id: petId, // Presence of ID tells the model to UPDATE
      caretaker_id: userId, // Used for ownership verification in SQL
      ...req.body, // name, age, weight, breed, etc.
      images: newImageFilenames, // Only passes the NEW images to be added
    };

    // 4. Create Instance
    const adoptable = new Adoptable(adoptableData);

    // 5. Call save()
    // Since 'id' is present in adoptableData, the model will run the UPDATE logic
    await adoptable.save();

    res.json({ message: "Update Successful!", petId: petId });
  } catch (err) {
    console.error("Error updating adoptable:", err);
    res.status(500).json({ message: "Failed to update adoptable." });
  }
}

function getAdopRequests(req, res) {
  return res.json([]);
}

async function deleteAdoptable(req, res) {
  const petId = req.params.id;
  try {
    const response = await Adoptable.deleteById(petId);
    res.status(201).json();
  } catch (err) {
    console.log(err);
    res.status(500).json();
  }
}

module.exports = {
  addAdoptable,
  getMyAdoptables,
  getAdoptables,
  getAdoptable,
  updateAdoptable,
  getAdopRequests,
  deleteAdoptable,
};
