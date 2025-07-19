// import React, { useState } from 'react';
// import { databases } from '../lib/appwrite'; // Your Appwrite client
// import { Query } from 'appwrite';
// import { IndianRupee, Search, Tag, Building, ServerCrash, Wind } from 'lucide-react';

// // --- Configuration ---
// const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
// const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID; 

// const PriceFinder = () => {
//   const [medicineName, setMedicineName] = useState('');
//   const [results, setResults] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searched, setSearched] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!medicineName.trim()) {
//       setError('Please enter a medicine name.');
//       return;
//     }
//     if (!DATABASE_ID || !COLLECTION_ID) {
//         setError('Configuration error: Appwrite DB/Collection ID is missing.');
//         console.error("Error: Make sure VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_COLLECTION_ID are set in your .env file.");
//         return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setResults([]);
//     setSearched(true);

//     try {
//       const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
//         Query.search('medicineName', medicineName),
//         Query.limit(50)
//       ]);
//       const sortedResults = response.documents.sort((a, b) => a.currentPrice - b.currentPrice);
//       setResults(sortedResults);
//       console.log(response);
//     } catch (err) {
//       console.error('Failed to fetch medicine prices:', err);
//       setError('Could not fetch data. Please check your connection or search term.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-black/20 p-6 rounded-2xl border border-white/10 shadow-lg backdrop-blur-xl animate-fade-in-up">
//       {/* Header Section */}
//       <div className="text-center mb-8">
//         <div className="inline-block p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4">
//           <IndianRupee className="w-8 h-8 text-white" />
//         </div>
//         <h2 className="text-2xl font-bold text-white">Find Best Medicine Price</h2>
//         <p className="text-gray-400 mt-2">Search for a medicine to find the supplier with the lowest price.</p>
//       </div>

//       {/* Search Form */}
//       <form onSubmit={handleSearch} className="flex gap-4 items-center mb-6">
//         <input
//           type="text"
//           value={medicineName}
//           onChange={(e) => setMedicineName(e.target.value)}
//           placeholder="e.g., Paracetamol, Atorvastatin"
//           className="flex-grow px-4 py-3 bg-white/5 border border-white/20 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-white transition-all"
//         />
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="flex items-center gap-2 py-3 px-6 border border-transparent rounded-lg shadow-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//         >
//           {isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
//           <span>{isLoading ? 'Searching...' : 'Search'}</span>
//         </button>
//       </form>

//       {/* Results Section */}
//       <div>
//         {error && (
//             <div className="flex items-center justify-center gap-3 text-red-300 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
//                 <ServerCrash className="w-6 h-6"/>
//                 <p>{error}</p>
//             </div>
//         )}

//         {isLoading && (
//             <div className="flex items-center justify-center gap-3 text-gray-400 p-4">
//                  <div className="w-6 h-6 border-t-2 border-purple-400 rounded-full animate-spin"></div>
//                 <p>Loading results...</p>
//             </div>
//         )}

//         {!isLoading && searched && results.length === 0 && !error && (
//             <div className="flex flex-col items-center justify-center gap-3 text-gray-400 bg-white/5 p-8 rounded-lg border border-white/10">
//                 <Wind className="w-10 h-10 text-purple-400"/>
//                 <p className="font-semibold text-white">No results found</p>
//                 <p className="text-sm">We couldn't find any listings for "{medicineName}".</p>
//             </div>
//         )}

//         {results.length > 0 && (
//           <div className="space-y-4">
//             {results.map((item, index) => (
//               <div
//                 key={item.$id}
//                 className={`p-5 rounded-xl transition-all duration-300 ${
//                   index === 0
//                     ? 'bg-purple-500/10 border border-purple-500/30 shadow-purple-500/10 shadow-lg'
//                     : 'bg-white/5 border border-white/10 hover:bg-white/10'
//                 }`}
//               >
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-4">
//                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-purple-500/20' : 'bg-white/10'}`}>
//                         <Building className={`w-6 h-6 ${index === 0 ? 'text-purple-300' : 'text-gray-400'}`} />
//                      </div>
//                      <div>
//                         <p className="font-bold text-white text-lg">{item.supplier}</p>
//                         <p className="text-sm text-gray-400">Brand: {item.company}</p>
//                      </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
//                       ₹{item.currentPrice.toFixed(2)}
//                     </p>
//                     {index === 0 && (
//                         <p className="text-xs font-semibold text-purple-300 mt-1">🏆 BEST PRICE</p>
//                     )}
//                   </div>
//                 </div>
//                  <div className="flex items-center gap-2 text-gray-500 mt-3 pt-3 border-t border-white/10 text-xs">
//                     <Tag className="w-3 h-3" />
//                     <span>Generic: {item.genericName}</span>
//                  </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PriceFinder;


import React, { useState } from 'react';
import { databases } from '../lib/appwrite'; // Your Appwrite client
import { Query } from 'appwrite';
import { IndianRupee, Search, Tag, Building, ServerCrash, Wind } from 'lucide-react';

// --- Configuration ---
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEDICINE_COLLECTION_ID; 

const PriceFinder = () => {
  const [medicineName, setMedicineName] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      setError('Please enter a medicine name.');
      return;
    }
    
    // Enhanced configuration check with more detailed error messages
    if (!DATABASE_ID || !COLLECTION_ID) {
        setError('Configuration error: Appwrite DB/Collection ID is missing.');
        console.error("Error: Make sure VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_COLLECTION_ID are set in your .env file.");
        console.error("Current values:", { DATABASE_ID, COLLECTION_ID });
        return;
    }

    // Debug log to check configuration
    console.log("Configuration check:", { 
      DATABASE_ID: DATABASE_ID ? "✓ Set" : "✗ Missing", 
      COLLECTION_ID: COLLECTION_ID ? "✓ Set" : "✗ Missing" 
    });

    setIsLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    try {
      console.log("Attempting to search for:", medicineName);
      console.log("Using DATABASE_ID:", DATABASE_ID);
      console.log("Using COLLECTION_ID:", COLLECTION_ID);

      // Option 1: Use contains query (requires creating an index on medicineName)
      // const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      //   Query.contains('medicineName', medicineName),
      //   Query.limit(50)
      // ]);

      // Option 2: Use startsWith query (requires creating an index on medicineName)
      // const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      //   Query.startsWith('medicineName', medicineName),
      //   Query.limit(50)
      // ]);

      // Option 3: Get all documents and filter client-side (works without index but less efficient)
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.limit(100) // Increase limit to get more results for filtering
      ]);

      // Filter results client-side for partial matches
      const filteredResults = response.documents.filter(doc => 
        doc.medicineName?.toLowerCase().includes(medicineName.toLowerCase())
      );
      
      console.log("Raw response:", response);
      
      if (!filteredResults || filteredResults.length === 0) {
        setResults([]);
        return;
      }

      const sortedResults = filteredResults.sort((a, b) => a.currentPrice - b.currentPrice);
      setResults(sortedResults);
      console.log("Filtered and sorted results:", sortedResults);
      
    } catch (err) {
      console.error('Detailed error information:', err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error type:', err.type);
      
      // More specific error messages based on common Appwrite errors
      let errorMessage = 'Could not fetch data. ';
      
      if (err.code === 401) {
        errorMessage += 'Authentication failed. Please check your API key.';
      } else if (err.code === 404) {
        errorMessage += 'Database or collection not found. Please verify your IDs.';
      } else if (err.code === 400) {
        errorMessage += 'Bad request. Please check your search parameters.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else if (err.message?.includes('CORS')) {
        errorMessage += 'CORS error. Please check your Appwrite configuration.';
      } else {
        errorMessage += `Error: ${err.message || 'Unknown error occurred'}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="bg-black/20 p-6 rounded-2xl border border-white/10 shadow-lg backdrop-blur-xl animate-fade-in-up">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4">
          <IndianRupee className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Find Best Medicine Price</h2>
        <p className="text-gray-400 mt-2">Search for a medicine to find the supplier with the lowest price.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-4 items-center mb-6">
        <input
          type="text"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          placeholder="e.g., Paracetamol, Atorvastatin"
          className="flex-grow px-4 py-3 bg-white/5 border border-white/20 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-white transition-all"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 py-3 px-6 border border-transparent rounded-lg shadow-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
          <span>{isLoading ? 'Searching...' : 'Search'}</span>
        </button>
      </form>

      {/* Results Section */}
      <div>
        {error && (
            <div className="flex items-center justify-start gap-3 text-red-300 bg-red-500/10 p-4 rounded-lg border border-red-500/20 mb-4">
                <ServerCrash className="w-6 h-6 flex-shrink-0"/>
                <p className="text-sm">{error}</p>
            </div>
        )}

        {isLoading && (
            <div className="flex items-center justify-center gap-3 text-gray-400 p-4">
                 <div className="w-6 h-6 border-t-2 border-purple-400 rounded-full animate-spin"></div>
                <p>Loading results...</p>
            </div>
        )}

        {!isLoading && searched && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center gap-3 text-gray-400 bg-white/5 p-8 rounded-lg border border-white/10">
                <Wind className="w-10 h-10 text-purple-400"/>
                <p className="font-semibold text-white">No results found</p>
                <p className="text-sm">We couldn't find any listings for "{medicineName}".</p>
            </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((item, index) => (
              <div
                key={item.$id}
                className={`p-5 rounded-xl transition-all duration-300 ${
                  index === 0
                    ? 'bg-purple-500/10 border border-purple-500/30 shadow-purple-500/10 shadow-lg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-purple-500/20' : 'bg-white/10'}`}>
                        <Building className={`w-6 h-6 ${index === 0 ? 'text-purple-300' : 'text-gray-400'}`} />
                     </div>
                     <div>
                        <p className="font-bold text-white text-lg">{item.supplier}</p>
                        <p className="text-sm text-gray-400">Brand: {item.company}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                      ₹{item.currentPrice.toFixed(2)}
                    </p>
                    {index === 0 && (
                        <p className="text-xs font-semibold text-purple-300 mt-1">🏆 BEST PRICE</p>
                    )}
                  </div>
                </div>
                 <div className="flex items-center gap-2 text-gray-500 mt-3 pt-3 border-t border-white/10 text-xs">
                    <Tag className="w-3 h-3" />
                    <span>Generic: {item.genericName}</span>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceFinder;