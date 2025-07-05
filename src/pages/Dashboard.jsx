import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CreateTaskModal from '../components/CreateTaskModel';
import EditTaskModal from '../components/EditTask';
import axiosInstance from '../api/axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const STATUSES = [
    { label: 'Todo', id: 'todo', status: 'Todo' },
    { label: 'In Progress', id: 'in_progress', status: 'In Progress' },
    { label: 'Done', id: 'done', status: 'Done' },
  ];

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/tasks');
      const fetchedTasks = res.data.map(t => ({ ...t, id: t._id }));
      setTasks(fetchedTasks);
    } catch {
      logout();
    }
  }, [logout]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/logs');
      setLogs(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchLogs();
  }, [fetchTasks, fetchLogs]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask) => {
      setTasks(prev => [...prev, { ...newTask, id: newTask._id }]);
      fetchLogs();
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks(prev => prev.map(task => task._id === updatedTask._id ? { ...updatedTask, id: updatedTask._id } : task));
      fetchLogs();
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks(prev => prev.filter(task => task._id !== taskId));
      fetchLogs();
    };

    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskDeleted', handleTaskDeleted);
    socket.on('logUpdated', fetchLogs);

    return () => {
      socket.off('taskCreated', handleTaskCreated);
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskDeleted', handleTaskDeleted);
      socket.off('logUpdated', fetchLogs);
    };
  }, [socket, fetchLogs]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const destStatusObj = STATUSES.find(s => s.id === destination.droppableId);
    if (!destStatusObj) {
      alert("⚠️ Drag failed. Please try again.");
      return;
    }

    const newStatus = destStatusObj.status;
    const taskToUpdate = tasks.find(t => t._id === draggableId);
    if (!taskToUpdate || source.droppableId === destination.droppableId) return;

    try {
      const res = await axiosInstance.put(`/tasks/${draggableId}`, {
        ...taskToUpdate,
        status: newStatus,
      });

      const updatedTask = { ...res.data, id: res.data._id };
      setTasks(prev => prev.map(task => task._id === draggableId ? updatedTask : task));
      socket.emit('taskUpdated', updatedTask);
    } catch {
      alert('❌ Failed to move task.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTask = async (newTask) => {
    try {
      const res = await axiosInstance.post('/tasks', newTask);
      const createdTask = { ...res.data, id: res.data._id };
      setTasks(prev => [...prev, createdTask]);
      socket.emit('taskCreated', createdTask);
    } catch {
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const res = await axiosInstance.put(`/tasks/${updatedTask._id}`, updatedTask);
      const freshTask = { ...res.data, id: res.data._id };
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? freshTask : t));
      socket.emit('taskUpdated', freshTask);
    } catch {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      socket.emit('taskDeleted', { taskId });
    } catch {
      alert('Failed to delete task');
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const res = await axiosInstance.post(`/tasks/${taskId}/smart-assign`);
      const updatedTask = { ...res.data, id: res.data._id };
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      socket.emit('taskUpdated', updatedTask);
    } catch {
      alert('Smart Assign failed');
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-gradient-to-br from-[#f0f4ff] to-[#e8eaf6] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <motion.h2 initial={{ x: -30 }} animate={{ x: 0 }} className="text-4xl font-bold text-gray-800 tracking-tight">
          Kanban Board
        </motion.h2>
        <div className="space-x-3">
          <button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2 rounded-full shadow-md transition transform hover:scale-105">
            + New Task
          </button>
          <button onClick={handleLogout} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 rounded-full shadow-md transition transform hover:scale-105">
            Logout
          </button>
        </div>
      </div>

      <CreateTaskModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateTask} />
      <EditTaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onUpdate={handleUpdateTask} task={selectedTask} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STATUSES.map(({ label, id, status }) => {
            const filtered = tasks.filter(task => task.status === status);

            return (
              <Droppable key={id} droppableId={id}>
                {(provided) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-lg p-6 min-h-[450px] border border-gray-200 hover:shadow-xl transition"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">{label}</h3>
                    {filtered.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-gray-300 rounded-xl p-4 mb-4 shadow hover:shadow-lg transform hover:scale-[1.02] transition"
                          >
                            <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <div className="flex space-x-3 text-xs">
                              <button onClick={() => handleSmartAssign(task._id)} className="text-blue-600 hover:text-blue-800 font-medium">Smart Assign</button>
                              <button onClick={() => openEditModal(task)} className="text-green-600 hover:text-green-800 font-medium">Edit</button>
                              <button onClick={() => handleDeleteTask(task._id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </motion.div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="mt-12 bg-white bg-opacity-80 rounded-2xl p-6 shadow border border-gray-200 max-h-60 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Activity Log</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          {logs.map(log => (
            <li key={log._id} className="border-b pb-2">
              <strong className="text-gray-800">{log.action}</strong> by {log.user?.username || 'Unknown'}
              <div className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
