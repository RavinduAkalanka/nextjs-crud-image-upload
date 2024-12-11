import { getCollection } from "../lib/db";
import { ObjectId } from "mongodb";
import Haiku from "./Haiku";

async function getHaikus(id) {
  const collection = await getCollection("haikus");
  const results = await collection
    .find({ author: ObjectId.createFromHexString(id) })
    .sort({ _id: -1 })
    .toArray();

  // Convert all non-plain objects to plain JavaScript values
  return results.map(haiku => ({
    _id: haiku._id.toString(), // Ensure _id is a string
    line1: haiku.line1,
    line2: haiku.line2,
    line3: haiku.line3,
    photo: haiku.photo,
    author: haiku.author.toString() // Ensure author is a string
  }));
}


export default async function Dashboard(props) {
  const haikus = await getHaikus(props.user.userId);
  return (
    <div>
      <h2 className="text-center text-2xl text-gray-600 font-bold mb-5">Your Haikus</h2>
      {haikus.map((haiku, index) => {
        return <Haiku haiku={haiku} key={index} />; // Plain object
      })}
    </div>
  );
}
