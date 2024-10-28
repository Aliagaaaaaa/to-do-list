import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: string
  projectId: number
}

interface Project {
  id: number
  name: string
}

export default function Component() {
  const [title, setTitle] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<"all" | "completed" | "active">("active")
  const [projects, setProjects] = useState<Project[]>([{ id: 1, name: "Default Project" }])
  const [currentProject, setCurrentProject] = useState<number>(1)
  const [newProjectName, setNewProjectName] = useState<string>("")

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedProjects = localStorage.getItem("projects")
    const lastUsedProject = localStorage.getItem("lastUsedProject")
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (lastUsedProject) setCurrentProject(Number(lastUsedProject))
  }, [])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("projects", JSON.stringify(projects))
    localStorage.setItem("lastUsedProject", currentProject.toString())
  }, [tasks, projects, currentProject])

  const handleAddTask = () => {
    if (title.trim() !== "") {
      const newTask: Task = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toLocaleString(),
        projectId: currentProject,
      }
      setTasks((prevTasks) => [...prevTasks, newTask])
      setTitle("")
    }
  }

  const handleToggleComplete = (id: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
  }

  const handleDeleteCompleted = () => {
    const filteredTasks = tasks.filter((task) => !task.completed)
    setTasks(filteredTasks)
  }

  const handleAddProject = () => {
    if (newProjectName.trim() !== "") {
      const newProject: Project = {
        id: Date.now(),
        name: newProjectName,
      }
      setProjects((prevProjects) => [...prevProjects, newProject])
      setNewProjectName("")
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const projectMatch = task.projectId === currentProject
    if (filter === "completed") return task.completed && projectMatch
    if (filter === "active") return !task.completed && projectMatch
    return projectMatch
  })

  const activeTasksCount = tasks.filter((task) => !task.completed && task.projectId === currentProject).length

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Advanced To-Do List</h1>

      <div className="flex flex-col gap-2 mb-4">
        <Input 
          value={newProjectName} 
          onChange={(e) => setNewProjectName(e.target.value)} 
          placeholder="New project name" 
        />
        <Button onClick={handleAddProject}>Add Project</Button>
      </div>

      <Select value={currentProject.toString()} onValueChange={(value) => setCurrentProject(Number(value))}>
        <SelectTrigger className="w-full mb-4">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-2 mb-4">
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
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
                <p className="text-sm text-muted-foreground">
                  Created at: {task.createdAt}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              <Button onClick={() => handleToggleComplete(task.id)} variant={task.completed ? "secondary" : "default"}>
                {task.completed ? "Completed" : "Mark as Done"}
              </Button>
            </div>
          </Card>
        ))}
      </ul>

      <p className="mt-4">{activeTasksCount} tasks left in this project</p>

      {tasks.some((task) => task.completed && task.projectId === currentProject) && (
        <Button onClick={handleDeleteCompleted} className="mt-4">
          Delete Completed
        </Button>
      )}
    </div>
  )
}