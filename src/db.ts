import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://maidb:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority";

export default async function DB() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    return client.db('streamapp');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}