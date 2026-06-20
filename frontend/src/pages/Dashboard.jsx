import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/dashboard.css";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://smart-task-manager-backend-g1kg.onrender.com/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/tasks",
        {
          title,
          description,
          priority,
          dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");

      fetchTasks();

      toast.success("Task created successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create task");
    }
  };

  const updateTask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://smart-task-manager-backend-g1kg.onrender.com/`,
        {
          title: editTitle,
          description: editDescription,
          priority: editPriority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingId(null);

      fetchTasks();

      toast.success("Task updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update task");
    }
  };

  const completeTask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        {
          status: "Completed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();

      toast.success("Task marked as completed");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmDelete) {
    return;
  }
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `https://smart-task-manager-backend-g1kg.onrender.com/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();

      toast.success("Task deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete task");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isOverdue = (task) => {
    return (
      task.status !== "Completed" &&
      task.dueDate &&
      new Date(task.dueDate) < new Date()
    );
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        task.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filter === "All" || task.status === filter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "Priority") {
        const order = {
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return order[b.priority] - order[a.priority];
      }

      if (sortBy === "DueDate") {
        return (
          new Date(a.dueDate || 0) -
          new Date(b.dueDate || 0)
        );
      }

      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    });

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const chartData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [
          completedTasks,
          pendingTasks,
        ],
        backgroundColor: [
          "#22c55e",
          "#f59e0b",
        ],
      },
    ],
  };

  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

    return (
  <div
  className={`layout ${
    darkMode ? "dark-mode" : ""
  }`}
>

    <div className="sidebar">
      <h2>🚀 STM</h2>

      <ul>
  <li
  className={activeSection === "dashboard" ? "active-menu" : ""}
  onClick={() => {
    setActiveSection("dashboard");
    document.getElementById("dashboard-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
>
  🚀 Dashboard
</li>

<li
  className={activeSection === "tasks" ? "active-menu" : ""}
  onClick={() => {
    setActiveSection("tasks");
    document.getElementById("tasks-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
>
  📝 My Tasks
</li>

<li
  className={activeSection === "stats" ? "active-menu" : ""}
  onClick={() => {
    setActiveSection("stats");
    document.getElementById("stats-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
>
  📊 Statistics
</li></ul>

    </div>

    <div id = "dashboard-section" className="dashboard">
    
      <div className="header">
        <h1 className="title">
          Smart Task Manager 🚀
        </h1>

        <button
  className="dark-btn"
  onClick={() =>
    setDarkMode(!darkMode)
  }
>
  {darkMode
    ? "☀ Light Mode"
    : "🌙 Dark Mode"}
</button>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      <div className="welcome-card">
  <h2>👋 Welcome Back</h2>

  <p>
    Manage your tasks efficiently and stay
    productive every day.
  </p>
</div>

     <div id = "stats-section" className="stats">
        <div className="stat-card">
  <h3>Completion Rate</h3>
  <h2>
    {totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        )}
    %
  </h2>
</div>

<div className="chart-card">
  <h2>Task Completion Overview</h2>

  <div className="chart-container">
    <Pie data={chartData} />
  </div>
</div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <h2>{totalTasks}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <h2>{completedTasks}</h2>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <h2>{pendingTasks}</h2>
        </div>
      </div>

      <div className="progress-card">
        <h3>Task Progress</h3>

        <p>
          {completedTasks} / {totalTasks} Tasks
          Completed
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercentage}%`,
            }}
          ></div>
        </div>

        <p>{progressPercentage}% Complete</p>
      </div>

      <div className="form-card">
        <h2>Create Task</h2>

        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Task Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
        />

        <button
          className="create-btn"
          onClick={createTask}
        >
          Create Task
        </button>
      </div>

      <div id = "tasks-section">
        <h2> My Tasks </h2>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>

      <select
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value)
        }
      >
        <option value="Newest">
          Sort: Newest First
        </option>
        <option value="Priority">
          Sort: Priority
        </option>
        <option value="DueDate">
          Sort: Due Date
        </option>
      </select>

      <br />
      <br />

      <div className="filter-buttons">
        <button onClick={() => setFilter("All")}>
          All
        </button>

        <button
          onClick={() => setFilter("Pending")}
        >
          Pending
        </button>

        <button
          onClick={() => setFilter("Completed")}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>
          Loading tasks...
        </p>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
  <h2>📋 No Tasks Yet</h2>

  <p>
    Create your first task above and
    start organizing your work.
  </p>
</div>
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task._id}
            className={`task-card ${
              isOverdue(task)
                ? "overdue-task"
                : ""
            }`}
          >
            {editingId === task._id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) =>
                    setEditTitle(e.target.value)
                  }
                />

                <input
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(
                      e.target.value
                    )
                  }
                />

                <select
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(
                      e.target.value
                    )
                  }
                >
                  <option value="Low">
                    Low
                  </option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="High">
                    High
                  </option>
                </select>

                <br />
                <br />
                <div className="button-group">

                <button
                  className="complete-btn"
                  onClick={() =>
                    updateTask(task._id)
                  }
                >
                  Save Changes
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    setEditingId(null)
                  }
                >
                  Cancel
                </button>
                </div>
              </>
              
            ) : (
              <>
                <h3>{task.title}</h3>

                <p className = "task-description">
                  {task.description}
                  </p>

                <p>
  <strong>Priority:</strong>{" "}
  <span
    className={`priority-badge ${task.priority.toLowerCase()}`}
  >
    {task.priority}
  </span>
</p>

                <p>
                  <strong>Due Date:</strong>{" "}
                  {task.dueDate
                    ? new Date(
                        task.dueDate
                      ).toLocaleDateString()
                    : "No Due Date"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      task.status ===
                      "Completed"
                        ? "completed"
                        : "pending"
                    }
                  >
                    {task.status}
                  </span>
                </p>

                {isOverdue(task) && (
                  <p className="overdue-text">
                    ⚠ Overdue Task
                  </p>
                )}

                <button
                  className="complete-btn"
                  onClick={() => {
                    setEditingId(task._id);
                    setEditTitle(task.title);
                    setEditDescription(
                      task.description
                    );
                    setEditPriority(
                      task.priority
                    );
                  }}
                >
                  Edit
                </button>

                {task.status !==
                  "Completed" && (
                  <button
                    className="complete-btn"
                    onClick={() =>
                      completeTask(task._id)
                    }
                  >
                    Mark Completed
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteTask(task._id)
                  }
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))
      )}
      <footer className="footer">
       Smart Task Manager © 2026
    </footer>
    </div>
    </div>
  );  
}

export default Dashboard;