"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "./hooks/use-toast"

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

type SortMethod = "alphabetical" | "reverseAlphabetical" | "creationDate"

const translations = {
  en: {
    title: "To-Do List",
    newProjectPlaceholder: "New project name",
    addProject: "Add Project",
    deleteProject: "Delete Project",
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
    confirmDeleteTitle: "Are you sure?",
    confirmDeleteDescription: "This action cannot be undone. This will permanently delete the project and all its tasks.",
    confirmDelete: "Yes, delete project",
    cancelDelete: "Cancel",
    sortBy: "Sort by:",
    alphabetical: "A-Z",
    reverseAlphabetical: "Z-A",
    creationDate: "Creation Date",
    duplicateProjectError: "A project with this name already exists.",
  },
  es: {
    title: "Lista de Tareas",
    newProjectPlaceholder: "Nombre del nuevo proyecto",
    addProject: "Agregar Proyecto",
    deleteProject: "Eliminar Proyecto",
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
    confirmDeleteTitle: "¿Estás seguro?",
    confirmDeleteDescription: "Esta acción no se puede deshacer. Eliminará permanentemente el proyecto y todas sus tareas.",
    confirmDelete: "Sí, eliminar proyecto",
    cancelDelete: "Cancelar",
    sortBy: "Ordenar por:",
    alphabetical: "A-Z",
    reverseAlphabetical: "Z-A",
    creationDate: "Fecha de Creación",
    duplicateProjectError: "Ya existe un proyecto con este nombre.",
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
  const [sortMethod, setSortMethod] = useState<SortMethod>("creationDate")
  const [newProjectId, setNewProjectId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedProjects = localStorage.getItem("projects")
    const lastUsedProject = localStorage.getItem("lastUsedProject")
    const savedLanguage = localStorage.getItem("language")
    const savedSortMethod = localStorage.getItem("sortMethod")
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (lastUsedProject) setCurrentProject(Number(lastUsedProject))
    if (savedLanguage) setLanguage(savedLanguage as "en" | "es")
    if (savedSortMethod) setSortMethod(savedSortMethod as SortMethod)
  }, [])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("projects", JSON.stringify(projects))
    localStorage.setItem("lastUsedProject", currentProject.toString())
    localStorage.setItem("language", language)
    localStorage.setItem("sortMethod", sortMethod)
  }, [tasks, projects, currentProject, language, sortMethod])

  const handleAddTask = () => {
    if (title.trim() !== "") {
      const newTask: Task = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
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
      if (projects.some(project => project.name.toLowerCase() === newProjectName.trim().toLowerCase())) {
        toast({
          title: t.duplicateProjectError,
          variant: "destructive",
        })
        return
      }

      const newProject: Project = {
        id: Date.now(),
        name: newProjectName.trim(),
      }
      setProjects((prevProjects) => [...prevProjects, newProject])
      setCurrentProject(newProject.id)
      setNewProjectId(newProject.id)
      setNewProjectName("")
    
      setTimeout(() => setNewProjectId(null), 2000)
    }
  }

  const handleDeleteProject = () => {
    if (projects.length > 1) {
      const updatedProjects = projects.filter((project) => project.id !== currentProject)
      const updatedTasks = tasks.filter((task) => task.projectId !== currentProject)
      setProjects(updatedProjects)
      setTasks(updatedTasks)
      setCurrentProject(updatedProjects[0].id)
    }
  }

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    switch (sortMethod) {
      case "alphabetical":
        return [...tasksToSort].sort((a, b) => a.title.localeCompare(b.title))
      case "reverseAlphabetical":
        return [...tasksToSort].sort((a, b) => b.title.localeCompare(a.title))
      case "creationDate":
        return [...tasksToSort].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return tasksToSort
    }
  }

  const filteredTasks = sortTasks(tasks.filter((task) => {
    const projectMatch = task.projectId === currentProject
    if (filter === "completed") return task.completed && projectMatch
    if (filter === "active") return !task.completed && projectMatch
    return projectMatch
  }))

  const activeTasksCount = tasks.filter((task) => !task.completed && task.projectId === currentProject).length

  const t = translations[language]

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="p-6 shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-4">{t.title}</h1>
          <div className="flex justify-center">
            <Button onClick={() => setLanguage(language === "en" ? "es" : "en")}>
              {t.toggleLanguage}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Input 
              value={newProjectName} 
              onChange={(e) => setNewProjectName(e.target.value)} 
              placeholder={t.newProjectPlaceholder} 
            />
            <Button onClick={handleAddProject} className="w-full">{t.addProject}</Button>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={currentProject.toString()} onValueChange={(value) => setCurrentProject(Number(value))}>
              <SelectTrigger className={`w-full ${newProjectId === currentProject ? 'ring-2 ring-primary animate-pulse' : ''}`}>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full md:w-auto">{t.deleteProject}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.confirmDeleteTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.confirmDeleteDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancelDelete}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject}>{t.confirmDelete}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={t.taskTitlePlaceholder} 
            />
            <Button onClick={handleAddTask} className="w-full">{t.addTask}</Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">{t.sortBy}</span>
            <Select value={sortMethod} onValueChange={(value) => setSortMethod(value as SortMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">{t.alphabetical}</SelectItem>
                <SelectItem value="reverseAlphabetical">{t.reverseAlphabetical}</SelectItem>
                <SelectItem value="creationDate">{t.creationDate}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "completed" | "active")} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">{t.all}</TabsTrigger>
            <TabsTrigger value="active">{t.active}</TabsTrigger>
            <TabsTrigger value="completed">{t.completed}</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TaskList tasks={filteredTasks} handleToggleComplete={handleToggleComplete} t={t} />
          </TabsContent>
          <TabsContent value="active">
            <TaskList tasks={filteredTasks.filter(task => !task.completed)} handleToggleComplete={handleToggleComplete} t={t} />
          </TabsContent>
          <TabsContent value="completed">
            <TaskList tasks={filteredTasks.filter(task => task.completed)} handleToggleComplete={handleToggleComplete} t={t} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>{activeTasksCount} {t.tasksLeft}</p>
          {tasks.some((task) => task.completed && task.projectId === currentProject) && (
            <Button onClick={handleDeleteCompleted} variant="outline">
              {t.deleteCompleted}
            </Button>
          )}
        </div>
      </Card>
      <Toaster />
    </div>
  )
}

function TaskList({ tasks, handleToggleComplete, t }: { tasks: Task[], handleToggleComplete: (id: number) => void, t: any }) {
  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <p className="text-sm text-muted-foreground">
                {t.createdAt} {new Date(task.createdAt).toLocaleString()}
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
  )
}