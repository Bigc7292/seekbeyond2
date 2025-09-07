
import React, { useState } from 'react';
import { Project } from '../types';
import { Header } from './Header';

interface CreateProjectPageProps {
  onProjectCreate: (project: Omit<Project, 'id'>) => void;
  projects: Project[];
}

export const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ onProjectCreate, projects }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setError('');
    onProjectCreate({ name, description, url, contextFilesMeta: [], linkedAvatarId: null, driveFilesMeta: [] });
    // Reset form
    setName('');
    setDescription('');
    setUrl('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-blue-200 mb-6">Create a New Project</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mx-auto">
                <div>
                    <label htmlFor="project-name" className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                    <input
                    type="text"
                    id="project-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Binghatti Skyblade"
                    className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white"
                    required
                    />
                </div>
                <div>
                    <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-1">Project Description</label>
                    <textarea
                    id="project-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed info about the property, amenities, pricing, location..."
                    className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white"
                    />
                </div>
                <div>
                    <label htmlFor="project-url" className="block text-sm font-medium text-gray-300 mb-1">Property URL</label>
                    <input
                    type="url"
                    id="project-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/property-listing"
                    className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white"
                    />
                </div>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                <button type="submit" className="w-full px-8 py-3 mt-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105">
                    Create Project
                </button>
            </form>

            <div className="mt-12">
                <h3 className="text-xl font-bold text-center text-blue-200 mb-6">Existing Projects</h3>
                {projects.length > 0 ? (
                    <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-blue-200 uppercase bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Project Name</th>
                                    <th scope="col" className="px-6 py-3">URL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(project => (
                                    <tr key={project.id} className="border-b border-gray-700 hover:bg-gray-700">
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">{project.name}</td>
                                        <td className="px-6 py-4 truncate max-w-xs">
                                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                {project.url}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No projects created yet.</p>
                )}
            </div>
        </main>
    </div>
  );
};