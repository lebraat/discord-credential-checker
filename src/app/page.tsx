'use client';

import { useEffect, useState } from 'react';
import { CredentialCheckResult } from '@/types/discord';

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CredentialCheckResult | null>(null);

  useEffect(() => {
    // Check for access token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
    } else if (token) {
      setAccessToken(token);
      // Clean URL
      window.history.replaceState({}, '', '/');
      // Check credentials automatically
      checkCredentials(token);
    }
  }, []);

  const checkCredentials = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/check-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: token }),
      });

      if (!response.ok) {
        throw new Error('Failed to check credentials');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Discord Credential Checker</h1>
          <p className="text-xl text-indigo-100">Verify your Discord account credentials</p>
        </div>

        {!accessToken && !loading && (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 127.14 96.36"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Credentials</h2>
            <p className="text-gray-600 mb-6">
              Login with Discord to check if you meet the following requirements:
            </p>
            <ul className="text-left text-gray-700 mb-8 space-y-2 max-w-md mx-auto">
              <li className="flex items-center">
                <span className="mr-2">✓</span> Account age &gt; 365 days
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Member of 10+ servers
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Has role assignments in 3+ servers
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Has 2+ verified external connections
              </li>
            </ul>
            <button
              onClick={handleLogin}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Login with Discord
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg">Checking your credentials...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Results</h2>
              <div
                className={`text-xl font-semibold ${
                  results.overallPassed ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {results.overallPassed
                  ? '✓ All checks passed!'
                  : '✗ Some checks failed'}
              </div>
            </div>

            <div className="space-y-6">
              {/* Account Age */}
              <div className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Account Age</h3>
                  <span
                    className={`text-2xl ${
                      results.accountAge.passed ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {results.accountAge.passed ? '✓' : '✗'}
                  </span>
                </div>
                <p className="text-gray-600">
                  Your account is{' '}
                  <span className="font-semibold">{results.accountAge.days} days</span> old
                  {!results.accountAge.passed && ' (needs to be &gt; 365 days)'}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(results.accountAge.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Server Count */}
              <div className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Server Membership</h3>
                  <span
                    className={`text-2xl ${
                      results.serverCount.passed ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {results.serverCount.passed ? '✓' : '✗'}
                  </span>
                </div>
                <p className="text-gray-600">
                  Member of <span className="font-semibold">{results.serverCount.count}</span>{' '}
                  servers
                  {!results.serverCount.passed && ' (needs 10 or more)'}
                </p>
              </div>

              {/* Role Assignments */}
              <div className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Role Assignments</h3>
                  <span
                    className={`text-2xl ${
                      results.roleAssignments.passed ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {results.roleAssignments.passed ? '✓' : '✗'}
                  </span>
                </div>
                <p className="text-gray-600">
                  Has roles in{' '}
                  <span className="font-semibold">
                    {results.roleAssignments.serversWithRoles}
                  </span>{' '}
                  servers
                  {!results.roleAssignments.passed && ' (needs 3 or more)'}
                </p>
                {results.roleAssignments.details.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Servers with roles:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {results.roleAssignments.details.slice(0, 5).map((detail, index) => (
                        <li key={index}>
                          • {detail.guildName} ({detail.roleCount}{' '}
                          {detail.roleCount === 1 ? 'role' : 'roles'})
                        </li>
                      ))}
                      {results.roleAssignments.details.length > 5 && (
                        <li className="text-gray-500">
                          + {results.roleAssignments.details.length - 5} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Verified Connections */}
              <div className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Verified External Connections
                  </h3>
                  <span
                    className={`text-2xl ${
                      results.verifiedConnections.passed ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {results.verifiedConnections.passed ? '✓' : '✗'}
                  </span>
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold">{results.verifiedConnections.count}</span>{' '}
                  verified connections
                  {!results.verifiedConnections.passed && ' (needs 2 or more)'}
                </p>
                {results.verifiedConnections.connections.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Connected accounts:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {results.verifiedConnections.connections.map((conn, index) => (
                        <li key={index}>
                          • {conn.type}: {conn.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setAccessToken(null);
                  setResults(null);
                  setError(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Check Another Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
