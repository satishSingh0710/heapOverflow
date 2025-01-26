import { Client, Account, Avatars, Databases, Storage } from "appwrite";
import env from "@/app/env";

const client = new Client();

client.setEndpoint(env.appwrite.endpoint).setProject(env.appwrite.projectId); // Replace with your project ID

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, avatars, databases, storage };
