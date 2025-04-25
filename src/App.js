import { useState, useEffect } from "react";

export default function HealthInformationSystem() {
  // Backend API URL
  const API_URL = "http://127.0.0.1:5000";
  
  // State management
  const [programs, setPrograms] = useState([]);
  const [clients, setClients] = useState([]);
  const [newProgram, setNewProgram] = useState("");
  const [newClient, setNewClient] = useState({
    id: "",
    name: "",
    age: "",
    gender: "",
    contact: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  // Get the active tab from local storage or default to "createProgram"
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("activeTab");
    return savedTab || "createProgram";
  });
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save selected client to localStorage when it changes
  useEffect(() => {
    if (selectedClient) {
      localStorage.setItem("selectedClient", JSON.stringify(selectedClient));
    }
  }, [selectedClient]);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // Fetch programs and clients on component mount
  useEffect(() => {
    fetchPrograms();
    fetchClients();
    
    // Restore selected client from localStorage if available
    const savedClient = localStorage.getItem("selectedClient");
    if (savedClient) {
      try {
        setSelectedClient(JSON.parse(savedClient));
      } catch (err) {
        console.error("Error parsing saved client:", err);
      }
    }
  }, []);

  // Generate a unique ID for clients
  useEffect(() => {
    setNewClient((prev) => ({
      ...prev,
      id: `CLIENT${Math.floor(Math.random() * 10000)}`,
    }));
  }, [clients]);

  // Fetch all programs from the backend
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/programs`);
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      const data = await response.json();
      setPrograms(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching programs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all clients from the backend
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clients`);
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
      
      // If there's a selected client, update it with fresh data
      if (selectedClient) {
        const updatedSelectedClient = data.find(c => c.id === selectedClient.id);
        if (updatedSelectedClient) {
          setSelectedClient(updatedSelectedClient);
          localStorage.setItem("selectedClient", JSON.stringify(updatedSelectedClient));
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new health program
  const handleCreateProgram = async () => {
    if (newProgram.trim()) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/programs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newProgram }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create program');
        }
        
        // Refresh programs list
        fetchPrograms();
        setNewProgram("");
      } catch (err) {
        setError(err.message);
        console.error("Error creating program:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Register a new client
  const handleRegisterClient = async () => {
    if (newClient.name && newClient.age) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/clients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newClient,
            programs: []
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to register client');
        }
        
        // Refresh clients list
        fetchClients();
        setNewClient({
          id: "",
          name: "",
          age: "",
          gender: "",
          contact: "",
        });
      } catch (err) {
        setError(err.message);
        console.error("Error registering client:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Enroll a client in programs
  const handleEnrollClient = async (clientId) => {
    if (selectedPrograms.length > 0) {
      setLoading(true);
      try {
        // Get the current client
        const client = clients.find(c => c.id === clientId);
        if (!client) return;
        
        // Get unique programs
        const uniquePrograms = [...new Set([...client.programs || [], ...selectedPrograms])];
        
        const response = await fetch(`${API_URL}/api/clients/${clientId}/enroll`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ programs: uniquePrograms }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to enroll client');
        }
        
        // Refresh clients list and update selected client
        await fetchClients();
        const updatedClient = clients.find(c => c.id === clientId);
        if (updatedClient) {
          setSelectedClient(updatedClient);
          localStorage.setItem("selectedClient", JSON.stringify(updatedClient));
        }
        
        setSelectedPrograms([]);
      } catch (err) {
        setError(err.message);
        console.error("Error enrolling client:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch a specific client
  const fetchClientById = async (clientId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error fetching client:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search for clients
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select client to view profile
  const handleViewProfile = async (client) => {
    setLoading(true);
    try {
      // Fetch latest client data
      const updatedClient = await fetchClientById(client.id);
      const clientToSet = updatedClient || client;
      setSelectedClient(clientToSet);
      localStorage.setItem("selectedClient", JSON.stringify(clientToSet));
      setActiveTab("viewProfile");
      setApiUrl(`${API_URL}/api/clients/${client.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle program selection
  const handleProgramSelection = (program) => {
    if (selectedPrograms.includes(program)) {
      setSelectedPrograms(selectedPrograms.filter((p) => p !== program));
    } else {
      setSelectedPrograms([...selectedPrograms, program]);
    }
  };

  // Handle tab change
  const changeTab = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem("activeTab", tabName);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="mb-2">Loading...</p>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Health Information System</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="flex mb-6 border-b overflow-x-auto">
        <button
          className={`px-4 py-2 ${activeTab === "createProgram" ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
          onClick={() => changeTab("createProgram")}
        >
          Create Program
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "registerClient" ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
          onClick={() => changeTab("registerClient")}
        >
          Register Client
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "enrollClient" ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
          onClick={() => changeTab("enrollClient")}
        >
          Enroll Client
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "searchClient" ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
          onClick={() => changeTab("searchClient")}
        >
          Search Client
        </button>
        {selectedClient && (
          <button
            className={`px-4 py-2 ${activeTab === "viewProfile" ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
            onClick={() => changeTab("viewProfile")}
          >
            Client Profile
          </button>
        )}
      </div>

      {/* Create Program Form */}
      {activeTab === "createProgram" && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create Health Program</h2>
          <div className="flex">
            <input
              type="text"
              className="border p-2 flex-grow mr-2"
              placeholder="Program Name (e.g., TB, Malaria, HIV)"
              value={newProgram}
              onChange={(e) => setNewProgram(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleCreateProgram}
            >
              Create Program
            </button>
          </div>
          
          {/* List of programs */}
          {programs.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Current Programs:</h3>
              <ul className="list-disc pl-5 mt-2">
                {programs.map((program, index) => (
                  <li key={index}>{typeof program === 'object' ? program.name : program}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Register Client Form */}
      {activeTab === "registerClient" && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Register New Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Client ID:</label>
              <input
                type="text"
                className="border p-2 w-full bg-gray-100"
                value={newClient.id}
                disabled
              />
            </div>
            <div>
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                className="border p-2 w-full"
                placeholder="Full Name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Age:</label>
              <input
                type="number"
                className="border p-2 w-full"
                placeholder="Age"
                value={newClient.age}
                onChange={(e) => setNewClient({ ...newClient, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Gender:</label>
              <select
                className="border p-2 w-full"
                value={newClient.gender}
                onChange={(e) => setNewClient({ ...newClient, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Contact Number:</label>
              <input
                type="text"
                className="border p-2 w-full"
                placeholder="Contact Number"
                value={newClient.contact}
                onChange={(e) => setNewClient({ ...newClient, contact: e.target.value })}
              />
            </div>
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={handleRegisterClient}
          >
            Register Client
          </button>
        </div>
      )}

      {/* Enroll Client in Programs */}
      {activeTab === "enrollClient" && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Enroll Client in Programs</h2>
          
          {clients.length === 0 ? (
            <p className="text-red-500">No clients registered yet. Please register clients first.</p>
          ) : programs.length === 0 ? (
            <p className="text-red-500">No programs created yet. Please create programs first.</p>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block mb-1">Select Client:</label>
                <select
                  className="border p-2 w-full"
                  onChange={(e) => {
                    const client = clients.find(c => c.id === e.target.value);
                    setSelectedClient(client);
                    if (client) {
                      localStorage.setItem("selectedClient", JSON.stringify(client));
                    }
                  }}
                  value={selectedClient?.id || ""}
                >
                  <option value="">Select a Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} (ID: {client.id})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedClient && (
                <div>
                  <h3 className="font-semibold mb-2">Select Programs:</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {programs.map((program, index) => {
                      const programName = typeof program === 'object' ? program.name : program;
                      return (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`program-${index}`}
                            className="mr-2"
                            checked={selectedPrograms.includes(programName)}
                            onChange={() => handleProgramSelection(programName)}
                          />
                          <label htmlFor={`program-${index}`}>{programName}</label>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => handleEnrollClient(selectedClient.id)}
                  >
                    Enroll in Selected Programs
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Client */}
      {activeTab === "searchClient" && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Search Clients</h2>
          <div className="mb-4">
            <input
              type="text"
              className="border p-2 w-full"
              placeholder="Search by client name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {clients.length === 0 ? (
            <p className="text-red-500">No clients registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Age</th>
                    <th className="px-4 py-2 text-left">Gender</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-t">
                      <td className="px-4 py-2">{client.id}</td>
                      <td className="px-4 py-2">{client.name}</td>
                      <td className="px-4 py-2">{client.age}</td>
                      <td className="px-4 py-2">{client.gender}</td>
                      <td className="px-4 py-2">
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => handleViewProfile(client)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View Client Profile */}
      {activeTab === "viewProfile" && selectedClient && (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Client Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-semibold">Client ID:</p>
              <p>{selectedClient.id}</p>
            </div>
            <div>
              <p className="font-semibold">Name:</p>
              <p>{selectedClient.name}</p>
            </div>
            <div>
              <p className="font-semibold">Age:</p>
              <p>{selectedClient.age}</p>
            </div>
            <div>
              <p className="font-semibold">Gender:</p>
              <p>{selectedClient.gender || "Not specified"}</p>
            </div>
            <div>
              <p className="font-semibold">Contact:</p>
              <p>{selectedClient.contact || "Not provided"}</p>
            </div>
          </div>
          
          <h3 className="font-semibold mt-4 mb-2">Enrolled Programs:</h3>
          {selectedClient.programs && selectedClient.programs.length > 0 ? (
            <ul className="list-disc pl-5">
              {selectedClient.programs.map((program, index) => (
                <li key={index}>{typeof program === 'object' ? program.name : program}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Not enrolled in any programs.</p>
          )}
          
        </div>
      )}
    </div>
  );
}