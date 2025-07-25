import React, { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite'; // Make sure to install 'appwrite' package: npm install appwrite

// --- Appwrite Configuration ---
// Using environment variables from .env file
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_kendra_COLLECTION_ID = import.meta.env.VITE_APPWRITE_kendra_COLLECTION_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

// Initialize the Appwrite client only if configuration is available
let client = null;
let databases = null;

if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
    client = new Client();
    client
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID);
    databases = new Databases(client);
}

// Component for displaying a single Kendra card
const KendraCard = ({ kendra }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:bg-slate-800 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
        <h2 className="text-xl font-bold text-purple-400 mb-2">{kendra.Name}</h2>
        <p className="text-sm text-gray-400 mb-4 font-mono">Kendra Code: {kendra['Kendra_Code'] || 'N/A'}</p>
        
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

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-gray-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Previous
            </button>
            
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                            ? 'bg-purple-600 text-white'
                            : page === '...'
                            ? 'text-gray-500 cursor-default'
                            : 'bg-slate-800/50 border border-slate-700 text-gray-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    {page}
                </button>
            ))}
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-gray-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Next
            </button>
        </div>
    );
};

// Main Search Component
const KendraSearch = () => {
    const [allKendraData, setAllKendraData] = useState([]);
    const [filteredKendraData, setFilteredKendraData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // Show 12 items per page (3x4 grid)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            // Check if Appwrite is properly configured
            if (!APPWRITE_PROJECT_ID || !APPWRITE_DATABASE_ID || !APPWRITE_kendra_COLLECTION_ID || !APPWRITE_ENDPOINT) {
                setError("Appwrite configuration is missing. Please check your environment variables. Required variables: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_kendra_COLLECTION_ID");
                setIsLoading(false);
                return;
            }

            if (!databases) {
                setError("Failed to initialize Appwrite client. Please check your configuration.");
                setIsLoading(false);
                return;
            }

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
                setError("Could not load Kendra data. Please check your Appwrite configuration and network connection. Error: " + e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredKendraData(allKendraData);
        } else {
            const filtered = allKendraData.filter(kendra => {
                const query = searchTerm.toLowerCase();
                return (
                    kendra.Name?.toLowerCase().includes(query) ||
                    kendra['State Name']?.toLowerCase().includes(query) ||
                    kendra['District Name']?.toLowerCase().includes(query) ||
                    kendra.Address?.toLowerCase().includes(query) ||
                    kendra['Kendra_Code']?.toLowerCase().includes(query) ||
                    kendra['Pin Code']?.toLowerCase().includes(query)
                );
            });
            setFilteredKendraData(filtered);
        }
        // Reset to first page when search term changes
        setCurrentPage(1);
    }, [searchTerm, allKendraData]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredKendraData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentKendraData = filteredKendraData.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                            <p className="text-2xl text-red-400 mb-4">Configuration Error</p>
                            <p className="text-lg text-red-300 mb-4">{error}</p>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <p className="text-sm text-gray-300 mb-2">To fix this issue, create a <code className="bg-slate-700 px-2 py-1 rounded">.env</code> file in your project root with:</p>
                                <pre className="text-xs text-gray-400 bg-slate-900 p-3 rounded overflow-x-auto">
{`VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_kendra_COLLECTION_ID=your_kendra_collection_id_here`}
                                </pre>
                            </div>
                        </div>
                    ) : filteredKendraData.length > 0 ? (
                        <>
                            {/* Results count */}
                            <div className="mb-6 text-center">
                                <p className="text-gray-400">
                                    Showing {startIndex + 1}-{Math.min(endIndex, filteredKendraData.length)} of {filteredKendraData.length} results
                                    {searchTerm && ` for "${searchTerm}"`}
                                </p>
                            </div>
                            
                            {/* Kendra Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentKendraData.map((kendra) => (
                                    <KendraCard key={kendra.$id} kendra={kendra} />
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
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
