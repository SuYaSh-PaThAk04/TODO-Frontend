import React, { useState } from 'react';

function CreateTaskModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');
    onCreate({ title, description, priority });
    setTitle('');
    setDescription('');
    setPriority('Low');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '300px' }}>
        <h3>Create New Task</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', marginBottom: '10px' }} />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', marginBottom: '10px' }}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button type="submit" style={{ marginRight: '10px' }}>Create</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
