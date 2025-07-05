import React, { useState, useEffect } from 'react';

export default function EditTaskModal({ isOpen, onClose, onUpdate, task }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setStatus(task.status || 'Todo');
    }
  }, [task]);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert('Title and description are required.');
      return;
    }

    onUpdate({
      ...task,
      title,
      description,
      priority,
      status
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Task</h2>

        <div className="mb-3">
          <label className="block text-sm mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
        </div>
      </div>
    </div>
  );
}
