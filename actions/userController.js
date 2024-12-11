"use server";

import { getCollection } from "../app/lib/db.js";
import bcrypt from "bcrypt";
import { cookies } from "next/headers.js";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

function isAlphaNumeric(x) {
  const regex = /^[a-zA-Z0-9]*$/;
  return regex.test(x);
}

export const register = async function (prevState, formData) {
  const errors = {};

  const ourUser = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  if (typeof ourUser.username != "string") ourUser.username = "";
  if (typeof ourUser.password != "string") ourUser.password = "";

  ourUser.username = ourUser.username.trim();
  ourUser.password = ourUser.password.trim();

  if (ourUser.username === "") errors.password = "You must provide a password";
  if (ourUser.username.length < 3)
    errors.username = "User Name as at least 3 characters";
  if (ourUser.username.length > 30)
    errors.username = "User Name cannot exceed 30 characters";
  if (!isAlphaNumeric(ourUser.username))
    errors.username = "Username can only contain lettrs and numbers";

  //see if username already exists or not

  const usersCollections = await getCollection("users")
  const userNameInQuestion = await usersCollections.findOne({username:ourUser.username})

  if(userNameInQuestion) {
    errors.username = "That username is already exists."
  }

  if (ourUser.password === "") errors.password = "You must provide a password";
  if (ourUser.password.length < 8)
    errors.password = "Password as at least 8 characters";
  if (ourUser.password.length > 15)
    errors.password = "Password cannot exceed 15 characters";

  if (errors.username || errors.password) {
    return {
      errors: errors,
      success: false,
    };
  }

  //hash Password
  const salt = bcrypt.genSaltSync(10);
  ourUser.password = bcrypt.hashSync(ourUser.password, salt);

  //storing a new user in the database.
  const usersCollection = await getCollection("users");
  const newUser = await usersCollection.insertOne(ourUser);
  const userId = newUser.insertedId.toString();

  //create out JWT value
  const ourTokenValue = jwt.sign(
    {
      skyColor: "blue",
      userId: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    process.env.JWTSECRET
  );

  // log the user in by giving them a cookie
  cookies().set("ourhaikuapp", ourTokenValue, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    secure: true,
  });

  return {
    success: true,
  };
};


//Loggin Function
export const login = async function (prevState, formData) {
  const errors = {};

  const ourUser = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  if (typeof ourUser.username !== "string") ourUser.username = "";
  if (typeof ourUser.password !== "string") ourUser.password = "";

  ourUser.username = ourUser.username.trim();
  ourUser.password = ourUser.password.trim();

  if (ourUser.username === "") errors.username = "Username is required";
  if (ourUser.password === "") errors.password = "Password is required";

  const collection = await getCollection("users");
  const user = await collection.findOne({ username: ourUser.username });

  if (!user) {
    errors.username = "Invalid username";
  } else {
    const matchOrNot = bcrypt.compareSync(ourUser.password, user.password);
    if (!matchOrNot) {
      errors.password = "Invalid password";
    }
  }

  if (Object.keys(errors).length) {
    return { success: false, errors };
  }

  // Create JWT and set cookie
  const ourTokenValue = jwt.sign(
    { userId: user._id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 },
    process.env.JWTSECRET
  );

  cookies().set("ourhaikuapp", ourTokenValue, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    secure: true,
  });

  return redirect("/");;
};


//Log out Function
export const logout = async function () {
  cookies().delete("ourhaikuapp");
  redirect("/");
};