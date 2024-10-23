import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

function App() {
  const [title, setTitle] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "active">("active");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (title.trim() !== "") {
      const newTask: Task = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toLocaleString(),
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTitle("");
    }
  };

  const handleToggleComplete = (id: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const handleDeleteCompleted = () => {
    const filteredTasks = tasks.filter((task) => !task.completed);
    setTasks(filteredTasks);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "active") return !task.completed;
    return true;
  });

  const activeTasksCount = tasks.filter((task) => !task.completed).length;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>

      <div className="flex flex-col gap-2 mb-4">
        <Input 
          value={title} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} 
          placeholder="Task title" 
        />
        <Button onClick={handleAddTask}>Add Task</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={() => setFilter("all")}>All</Button>
        <Button onClick={() => setFilter("active")}>Active</Button>
        <Button onClick={() => setFilter("completed")}>Completed</Button>
      </div>

      <ul className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-4 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{task.title}</h2>
                <p className="text-sm text-gray-500">
                  Created at: {task.createdAt}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              <Button onClick={() => handleToggleComplete(task.id)} className={task.completed ? "bg-green-500" : "bg-blue-500"}>
                {task.completed ? "Completed" : "Mark as Done"}
              </Button>
            </div>
          </Card>
        ))}
      </ul>

      <p className="mt-4">{activeTasksCount} tasks left</p>

      {tasks.some((task) => task.completed) && (
        <Button onClick={handleDeleteCompleted} className="mt-4">
          Delete Completed
        </Button>
      )}
    </div>
  );
}

export default App;
