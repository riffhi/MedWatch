import React, { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite'; // Make sure to install 'appwrite' package: npm install appwrite

// --- Appwrite Configuration ---
// Using environment variables from .env file
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_kendra_COLLECTION_ID = import.meta.env.VITE_APPWRITE_kendra_COLLECTION_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

// Initialize the Appwrite client
const client = new Client();
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);

// Component for displaying a single Kendra card
const KendraCard = ({ kendra }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:bg-slate-800 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
        <h2 className="text-xl font-bold text-purple-400 mb-2">{kendra.Name}</h2>
        <p className="text-sm text-gray-400 mb-4 font-mono">Kendra Code: {kendra['Kendra Code']}</p>
        
        <div className="space-y-3 text-gray-300">
            <div className="flex items-start">
                {/* Using inline SVG for the location icon */}
                <svg className="w-5 h-5 mr-3 mt-1 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{kendra.Address}, {kendra['District Name']}, {kendra['State Name']} - {kendra['Pin Code']}</span>
            </div>
            <div className="flex items-center">
                {/* Using inline SVG for the contact icon */}
                <svg className="w-5 h-5 mr-3 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>{kendra.Contact}</span>
            </div>
        </div>
    </div>
);

// Main Search Component
const KendraSearch = () => {
    const [allKendraData, setAllKendraData] = useState([]);
    const [filteredKendraData, setFilteredKendraData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_kendra_COLLECTION_ID,
                    [Query.limit(5000)]
                );
                setAllKendraData(response.documents);
                setFilteredKendraData(response.documents);
            } catch (e) {
                console.error("Failed to fetch data from Appwrite:", e);
                setError("Could not load Kendra data. Please check your Appwrite configuration and network connection.");
            } finally {
                setIsLoading(false);
            }
        };

        if (!APPWRITE_PROJECT_ID || !APPWRITE_DATABASE_ID || !APPWRITE_kendra_COLLECTION_ID) {
            setError("Appwrite configuration is missing. Please check your environment variables.");
            setIsLoading(false);
        } else {
            fetchData();
        }
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredKendraData(allKendraData);
            return;
        }
        const filtered = allKendraData.filter(kendra => {
            const query = searchTerm.toLowerCase();
            return (
                kendra.Name?.toLowerCase().includes(query) ||
                kendra['State Name']?.toLowerCase().includes(query) ||
                kendra['District Name']?.toLowerCase().includes(query) ||
                kendra.Address?.toLowerCase().includes(query) ||
                kendra['Kendra Code']?.toLowerCase().includes(query) ||
                kendra['Pin Code']?.toLowerCase().includes(query)
            );
        });
        setFilteredKendraData(filtered);
    }, [searchTerm, allKendraData]);

    return (
        <div className="text-white font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-purple-400">Kendra Search Portal</h1>
                    <p className="text-lg text-gray-400 mt-2">Find Pradhan Mantri Bhartiya Janaushadhi Kendras near you.</p>
                </header>

                <div className="mb-8 sticky top-4 z-10">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, state, district, address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 pl-12 bg-slate-800/50 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all duration-300 text-white placeholder-gray-400"
                        />
                         {/* Using inline SVG for the search icon */}
                        <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <main>
                    {isLoading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                            <p className="mt-4 text-xl">Loading Data from Appwrite...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 bg-red-900/20 border border-red-500 rounded-lg p-6">
                            <p className="text-2xl text-red-400">{error}</p>
                        </div>
                    ) : filteredKendraData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredKendraData.map((kendra) => (
                                <KendraCard key={kendra.$id} kendra={kendra} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-2xl text-gray-400">No results found.</p>
                            <p className="text-gray-500">Try adjusting your search terms or check your data source.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default KendraSearch;
