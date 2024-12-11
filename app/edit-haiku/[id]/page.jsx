import HaikuForm from "../../components/HaikuForm";
import { getCollection } from "../../lib/db";
import { ObjectId } from "mongodb";
import { getUserFromCookie } from "../../lib/getUser";
import { redirect } from "next/navigation";

async function getDoc(id) {
    if (!ObjectId.isValid(id)) {
        console.error("Invalid ID format: ID must be a 24-character hexadecimal string.");
        return null; // Return null if the ID is invalid
    }

    const haikusCollection = await getCollection("haikus");
    const result = await haikusCollection.findOne({ _id: ObjectId.createFromHexString(id) });

    // Convert the ObjectId and any other complex objects to strings
    if (result) {
        result._id = result._id.toString();
        result.author = result.author.toString();
    }

    return result;
}

export default async function Page(props) {
    const doc = await getDoc(props.params.id);

    // Handle the case where the document is null (invalid ID)
    if (!doc) {
        return (
            <div>
                <h2 className="text-center text-2xl text-red-600 mb-5">Invalid or non-existent Haiku ID</h2>
            </div>
        );
    }

    // Get user data from cookie
    const user = await getUserFromCookie();

    // Handle the case where user is not found or doesn't have a userId
    if (!user || !user.userId) {
        console.error("User not found or invalid user data.");
        return redirect("/"); // Redirect to login page or home page
    }

    // Ensure that only the author can edit the Haiku
    if (user.userId !== doc.author) {
        return redirect("/");
    }

    return (
        <div>
            <h2 className="text-center text-2xl text-gray-600 font-bold mb-5">Edit Haiku</h2>
            <HaikuForm haiku={doc} action="edit" />
        </div>
    );
}
