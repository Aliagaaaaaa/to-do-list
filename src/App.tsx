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

const translations = {
  en: {
    title: "Advanced To-Do List",
    newProjectPlaceholder: "New project name",
    addProject: "Add Project",
    selectProject: "Select a project",
    taskTitlePlaceholder: "Task title",
    addTask: "Add Task",
    all: "All",
    active: "Active",
    completed: "Completed",
    createdAt: "Created at:",
    markAsDone: "Mark as Done",
    tasksLeft: "tasks left in this project",
    deleteCompleted: "Delete Completed",
    toggleLanguage: "Cambiar a Español",
  },
  es: {
    title: "Lista de Tareas Avanzada",
    newProjectPlaceholder: "Nombre del nuevo proyecto",
    addProject: "Agregar Proyecto",
    selectProject: "Seleccionar un proyecto",
    taskTitlePlaceholder: "Título de la tarea",
    addTask: "Agregar Tarea",
    all: "Todas",
    active: "Activas",
    completed: "Completadas",
    createdAt: "Creada el:",
    markAsDone: "Marcar como Hecha",
    tasksLeft: "tareas pendientes en este proyecto",
    deleteCompleted: "Eliminar Completadas",
    toggleLanguage: "Switch to English",
  },
}

export default function Component() {
  const [title, setTitle] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<"all" | "completed" | "active">("active")
  const [projects, setProjects] = useState<Project[]>([{ id: 1, name: "Default Project" }])
  const [currentProject, setCurrentProject] = useState<number>(1)
  const [newProjectName, setNewProjectName] = useState<string>("")
  const [language, setLanguage] = useState<"en" | "es">("en")

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedProjects = localStorage.getItem("projects")
    const lastUsedProject = localStorage.getItem("lastUsedProject")
    const savedLanguage = localStorage.getItem("language")
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (lastUsedProject) setCurrentProject(Number(lastUsedProject))
    if (savedLanguage) setLanguage(savedLanguage as "en" | "es")
  }, [])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("projects", JSON.stringify(projects))
    localStorage.setItem("lastUsedProject", currentProject.toString())
    localStorage.setItem("language", language)
  }, [tasks, projects, currentProject, language])

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

  const t = translations[language]

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-center mb-2">{t.title}</h1>
        <div className="flex justify-center">
          <Button onClick={() => setLanguage(language === "en" ? "es" : "en")}>
            {t.toggleLanguage}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <Input 
          value={newProjectName} 
          onChange={(e) => setNewProjectName(e.target.value)} 
          placeholder={t.newProjectPlaceholder} 
        />
        <Button onClick={handleAddProject}>{t.addProject}</Button>
      </div>

      <Select value={currentProject.toString()} onValueChange={(value) => setCurrentProject(Number(value))}>
        <SelectTrigger className="w-full mb-4">
          <SelectValue placeholder={t.selectProject} />
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
          placeholder={t.taskTitlePlaceholder} 
        />
        <Button onClick={handleAddTask}>{t.addTask}</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={() => setFilter("all")}>{t.all}</Button>
        <Button onClick={() => setFilter("active")}>{t.active}</Button>
        <Button onClick={() => setFilter("completed")}>{t.completed}</Button>
      </div>

      <ul className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-4 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{task.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.createdAt} {task.createdAt}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              <Button onClick={() => handleToggleComplete(task.id)} variant={task.completed ? "secondary" : "default"}>
                {task.completed ? t.completed : t.markAsDone}
              </Button>
            </div>
          </Card>
        ))}
      </ul>

      <p className="mt-4">{activeTasksCount} {t.tasksLeft}</p>

      {tasks.some((task) => task.completed && task.projectId === currentProject) && (
        <Button onClick={handleDeleteCompleted} className="mt-4">
          {t.deleteCompleted}
        </Button>
      )}
    </div>
  )
}
