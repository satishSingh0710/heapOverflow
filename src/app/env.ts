const env = {
  appwrite: {
    endpoint: String(process.env.NEXT_PUBLIC_APPWRITE_HOST_URL),
    projectId: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
    apiKey: String(process.env.APPWRITE_API_KEY),
  },
};

export const printEnv = ()=>{
  console.log(env.appwrite.endpoint); 
  console.log(env.appwrite.projectId);
  console.log(env.appwrite.apiKey);
}

export default env;
