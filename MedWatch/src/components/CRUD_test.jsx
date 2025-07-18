import React from 'react';
import { databases } from '../lib/appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID; // Replace with your Appwrite DB ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEDICINE_COLLECTION_ID; // Replace with your medicines collection ID

const CRUD_test = () => {
  const handleCreate = async () => {
    await databases.createDocument(DB_ID, COLLECTION_ID, 'unique()', {
      name: 'Test Medicine',
      quantity: 10,
    });
    alert('Created!');
  };

  const handleRead = async () => {
    const res = await databases.listDocuments(DB_ID, COLLECTION_ID);
    alert(JSON.stringify(res.documents));
  };

  const handleUpdate = async () => {
    // Replace 'document_id' with a real document ID
    await databases.updateDocument(DB_ID, COLLECTION_ID, 'document_id', {
      quantity: 20,
    });
    alert('Updated!');
  };

  const handleDelete = async () => {
    // Replace 'document_id' with a real document ID
    await databases.deleteDocument(DB_ID, COLLECTION_ID, 'document_id');
    alert('Deleted!');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">CRUD Test for Medicines</h2>
      <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
      <button onClick={handleRead} className="px-4 py-2 bg-blue-600 text-white rounded">Read</button>
      <button onClick={handleUpdate} className="px-4 py-2 bg-yellow-600 text-white rounded">Update</button>
      <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
    </div>
  );
};

export default CRUD_test;