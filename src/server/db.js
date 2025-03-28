import * as mongoose from "mongoose";
const Schema = mongoose.Schema;
const the_schema = new Schema({
  text: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    default: Date.now().toString(),
  },
});
const TheTexts = mongoose.model("texts", the_schema);

function saveTextToDB(text) {
  const newTask = new TheTexts({
    text: text,
    created_at: Date.now().toString(),
  });

  newTask
    .save()
    .then((obj) => console.log("Created: ", obj.text.slice(0, 10)))
    .catch((err) => console.log(err));

  TheTexts.countDocuments().then((count) => {
    if (count >= 5) {
      TheTexts.findOneAndDelete({}, { sort: { created_at: 1 } }).then((obj) =>
        console.log("Deleted: ", obj.text.slice(0, 10)),
      );
    }
  });
}

async function getTexts() {
  const texts = await TheTexts.find();
  return texts
    .map((obj) => {
      return { text: obj.text, unixTime: obj.created_at };
    })
    .reverse();
}

async function deleteFile(unixTime) {
  await TheTexts.findOneAndRemove({ created_at: unixTime });
}

export { getTexts, saveTextToDB, deleteFile };
