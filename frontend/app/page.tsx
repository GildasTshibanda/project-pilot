"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Bell,
  Users,
  ChartNoAxesCombined,
  Paperclip,
  FileText,
  Check,
  CheckSquare,
  Circle,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sun,
} from "lucide-react";

// Les statuts sont centralisés pour éviter les variantes de texte dans l'application.
type ProjectStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
type TaskStatus = ProjectStatus;
type Priority = "LOW" | "MEDIUM" | "HIGH";

type UserProfile = {
  id: number;
  name: string;
  avatarUrl: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  dueDate: string;
  status: ProjectStatus;
  members: UserProfile[];
};

type Task = {
  id: number;
  title: string;
  projectId: number;
  assigneeId: number;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
};

const THEME_CHANGE_EVENT = "projectpilot-theme-change";
const THEME_STORAGE_KEY = "projectpilot-theme";

// Données de démonstration. Elles seront remplacées par les données de l'API NestJS.
const demoUsers: UserProfile[] = [
  {
    id: 1,
    name: "Alex Morgan",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
  },
  {
    id: 2,
    name: "Sam Taylor",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces",
  },
  {
    id: 3,
    name: "Jordan Lee",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces",
  },
];

const initialProjects: Project[] = [
  {
    id: 1,
    name: "ProjectPilot",
    description: "A focused workspace to plan projects and finish meaningful work.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
    dueDate: "2026-10-28",
    status: "IN_PROGRESS",
    members: [demoUsers[0], demoUsers[1], demoUsers[2]],
  },
  {
    id: 2,
    name: "PresencePlus",
    description: "Attendance management for universities and higher education institutions.",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop",
    dueDate: "2026-11-12",
    status: "IN_PROGRESS",
    members: [demoUsers[0], demoUsers[1]],
  },
  {
    id: 3,
    name: "Portfolio website",
    description: "A clean portfolio to present projects and experience.",
    imageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&auto=format&fit=crop",
    dueDate: "2026-11-20",
    status: "TODO",
    members: [demoUsers[0]],
  },
];

const initialTasks: Task[] = [
  { id: 1, title: "Finalize the dashboard layout", projectId: 1, assigneeId: 1, priority: "HIGH", status: "IN_PROGRESS", dueDate: "2026-10-18" },
  { id: 2, title: "Review the database schema", projectId: 2, assigneeId: 2, priority: "MEDIUM", status: "TODO", dueDate: "2026-10-22" },
  { id: 3, title: "Define the typography system", projectId: 3, assigneeId: 1, priority: "LOW", status: "COMPLETED" },
  { id: 4, title: "Create the responsive navigation", projectId: 1, assigneeId: 3, priority: "HIGH", status: "TODO", dueDate: "2026-10-20" },
];

const statusLabels: Record<ProjectStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

function subscribeToTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getThemeSnapshot() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
}

function getServerThemeSnapshot() {
  return false;
}

function formatDate(date: string) {
  if (!date) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function getProjectProgress(projectId: number, tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  if (projectTasks.length === 0) return 0;

  const completedTasks = projectTasks.filter((task) => task.status === "COMPLETED").length;
  return Math.round((completedTasks / projectTasks.length) * 100);
}

function AvatarStack({ members }: { members: UserProfile[] }) {
  return (
    <div className="avatar-stack" aria-label={`${members.length} project contributor${members.length === 1 ? "" : "s"}`}>
      {members.slice(0, 4).map((member) => (
        <Image
          className="contributor-avatar"
          key={member.id}
          src={member.avatarUrl}
          width={96}
          height={96}
          unoptimized
          alt={member.name}
          title={member.name}
        />
      ))}
      {members.length > 4 && (
        <span className="avatar-overflow">+{members.length - 4}</span>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project) => void;
}) {
  return (
    <button
      className="project-card project-card-minimal"
      type="button"
      onClick={() => onOpen(project)}
      aria-label={`Open project ${project.name}`}
    >
      <Image
        className="project-cover"
        src={project.imageUrl}
        alt=""
        width={1200}
        height={675}
        unoptimized
      />
      <span className="project-card-heading">
        <span className="project-card-name">{project.name}</span>
        <ArrowUpRight size={17} aria-hidden="true" />
      </span>
      <span className="project-card-members">
        <AvatarStack members={project.members} />
        <span className="project-member-count">
          {project.members.length} {project.members.length === 1 ? "contributor" : "contributors"}
        </span>
      </span>
    </button>
  );
}

function TaskRow({
  task,
  assignee,
  onStatusChange,
}: {
  task: Task;
  assignee: UserProfile | undefined;
  onStatusChange: (taskId: number, status: TaskStatus) => void;
}) {
  return (
    <article className="detail-task-row">
      <div className="detail-task-main">
        <span className={`task-status-mark status-mark-${task.status.toLowerCase()}`}>
          {task.status === "COMPLETED" ? <Check size={14} /> : <Circle size={14} />}
        </span>
        <div className="detail-task-copy">
          <strong className={task.status === "COMPLETED" ? "detail-task-completed" : ""}>
            {task.title}
          </strong>
          <span>
            {assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
            {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
          </span>
        </div>
      </div>

      <span className={`priority priority-${task.priority.toLowerCase()}`}>
        {priorityLabels[task.priority]}
      </span>

      <label className="task-status-select-label">
        <span className="sr-only">Status for {task.title}</span>
        <select
          className="task-status-select"
          value={task.status}
          onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </label>
    </article>
  );
}

export default function Home() {
  const dark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeView, setActiveView] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState<number>(initialProjects[0].id);
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [taskProjectFilter, setTaskProjectFilter] = useState<number | "ALL">("ALL");
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  const [attachments, setAttachments] = useState<{ id: number; name: string; size: number; projectId: number }[]>([]);
  const [attachmentProjectId, setAttachmentProjectId] = useState<number>(initialProjects[0].id);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  function toggleTheme() {
    const nextTheme = dark ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newProjectName.trim();
    if (!name) return;

    const project: Project = {
      id: Date.now(),
      name,
      description: "A new project, ready to take shape.",
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
      dueDate: "",
      status: "TODO",
      members: [demoUsers[0]],
    };

    setProjects((currentProjects) => [...currentProjects, project]);
    setNewProjectName("");
    setIsCreateFormOpen(false);
    setActiveView("Projects");
  }

  function updateTaskStatus(taskId: number, status: TaskStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );
  }

  function updateProjectStatus(projectId: number, status: ProjectStatus) {
    setProjects((currentProjects) =>
      currentProjects.map((project) => (project.id === projectId ? { ...project, status } : project)),
    );
  }

  function openProject(project: Project) {
    setSelectedProjectId(project.id);
  }

  // Crée une tâche locale et l'associe à un projet existant.
  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || !projects.some((project) => project.id === newTaskProjectId)) return;

    setTasks((currentTasks) => [...currentTasks, {
      id: Date.now(),
      title,
      projectId: newTaskProjectId,
      assigneeId: demoUsers[0].id,
      priority: newTaskPriority,
      status: "TODO",
      ...(newTaskDueDate ? { dueDate: newTaskDueDate } : {}),
    }]);
    setNewTaskTitle("");
    setNewTaskDueDate("");
    setNewTaskPriority("MEDIUM");
    setIsCreateTaskOpen(false);
    setActiveView("My tasks");
    setSelectedProjectId(null);
  }

  function returnToProjectList() {
    setSelectedProjectId(null);
  }

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const visibleProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(normalizedSearch),
  );

  const visibleTasks = tasks.filter((task) => {
    if (activeView === "My tasks") {
      return (taskProjectFilter === "ALL" || task.projectId === taskProjectFilter);
    }
    if (selectedProject) return task.projectId === selectedProject.id;
    return true;
  });

  const completedTaskCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const openTaskCount = tasks.length - completedTaskCount;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a href="#" className="brand" onClick={(event) => { event.preventDefault(); returnToProjectList(); setActiveView("Overview"); }}>
          <span className="brand-mark"><FolderKanban size={20} /></span>
          <span>Project<span className="brand-light">Pilot</span></span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={`nav-item ${activeView === "Overview" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Overview"); }}>
            <LayoutDashboard size={18} /><span>Overview</span>
          </button>
          <button className={`nav-item ${activeView === "Projects" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Projects"); }}>
            <FolderKanban size={18} /><span>Projects</span><span className="nav-count">{projects.length}</span>
          </button>
          <button className={`nav-item ${activeView === "My tasks" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("My tasks"); }}>
            <CheckSquare size={18} /><span>My tasks</span><span className="nav-count">{openTaskCount}</span>
          </button>
          <button className={`nav-item ${activeView === "Calendar" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Calendar"); }}>
            <CalendarDays size={18} /><span>Calendar</span>
          </button>
          <button className={`nav-item ${activeView === "Team" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Team"); }}><Users size={18} /><span>Team</span><span className="nav-count">{demoUsers.length}</span></button>
          <button className={`nav-item ${activeView === "Notifications" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Notifications"); }}><Bell size={18} /><span>Notifications</span>{tasks.filter(t => t.status !== "COMPLETED" && t.priority === "HIGH").length > readNotifications.length && <span className="notification-dot" />}</button>
          <button className={`nav-item ${activeView === "Analytics" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Analytics"); }}><ChartNoAxesCombined size={18} /><span>Analytics</span></button>
          <button className={`nav-item ${activeView === "Attachments" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Attachments"); }}><Paperclip size={18} /><span>Attachments</span><span className="nav-count">{attachments.length}</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="focus-card">
            <div className="focus-icon"><Clock3 size={17} /></div>
            <p className="focus-title">Stay focused</p>
            <p className="focus-copy">Small steps lead to big results.</p>
            <div className="focus-progress"><span /></div>
            <p className="focus-caption">One thing at a time.</p>
          </div>
          <button className={`nav-item ${activeView === "Settings" ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Settings"); }}>
            <Settings size={18} /><span>Settings</span>
          </button>
          <div className="profile">
            <div className="avatar">P</div>
            <div className="profile-info"><strong>My workspace</strong><span>Personal account</span></div>
            <MoreHorizontal size={19} className="profile-more" />
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <button type="button" className="breadcrumb-link" onClick={() => { returnToProjectList(); setActiveView("Overview"); }}>Workspace</button>
            <span className="breadcrumb-separator">/</span>
            <strong>{selectedProject?.name ?? activeView}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Search projects"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") { returnToProjectList(); setActiveView("Search"); } }}
              />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button theme-button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="profile-trigger" type="button" title="Profile" aria-label="Open profile" onClick={() => { returnToProjectList(); setActiveView("Profile"); }}><span className="avatar top-avatar">P</span></button>
          </div>
        </header>

        <div className="page-content">
          {selectedProject ? (
            <ProjectDashboard
              project={selectedProject}
              tasks={tasks.filter((task) => task.projectId === selectedProject.id)}
              onBack={returnToProjectList}
              onTaskStatusChange={updateTaskStatus}
              onProjectStatusChange={updateProjectStatus}
            />
          ) : (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="status-dot" /> YOUR PERSONAL WORKSPACE</div>
                  <h1>{activeView === "Overview" ? "Good to see you." : activeView}</h1>
                  <p className="page-subtitle">
                    {activeView === "Projects"
                      ? "A calm, clear view of everything you're building."
                      : activeView === "My tasks"
                        ? "Keep your next steps clear and manageable."
                        : activeView === "Team"
                          ? "People, responsibilities and collaboration in one place."
                          : activeView === "Notifications"
                            ? "Stay aware of important work without losing focus."
                            : activeView === "Analytics"
                              ? "Understand progress and spot what needs attention."
                              : activeView === "Attachments"
                                ? "Files connected to the work your team is doing."
                                : activeView === "Search"
                                  ? "Search across projects and tasks. Press Enter to view results."
                                  : "A little progress each day adds up to big results."}
                  </p>
                </div>
                {(activeView === "Overview" || activeView === "Projects") && (
                  <button className="primary-button" onClick={() => setIsCreateFormOpen(true)}>
                    <Plus size={17} strokeWidth={2.2} /> New project
                  </button>
                )}
              </section>

              {isCreateFormOpen && (
                <form className="new-project-form" onSubmit={createProject}>
                  <div>
                    <strong>Create a project</strong>
                    <p>Give your next idea a name.</p>
                  </div>
                  <input
                    autoFocus
                    aria-label="Project name"
                    placeholder="e.g. Learn TypeScript"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                    required
                    maxLength={80}
                  />
                  <button type="submit" className="primary-button">Create</button>
                  <button type="button" className="secondary-button" onClick={() => setIsCreateFormOpen(false)}>Cancel</button>
                </form>
              )}

              {activeView === "Overview" ? (
                <section className="overview-dashboard" aria-label="Workspace overview">
                  {/* L’accueil présente l’application et l’activité globale, pas une deuxième liste de projets. */}
                  <section className="overview-intro-card">
                    <div className="overview-intro-copy">
                      <span className="overview-kicker"><span className="status-dot" /> YOUR WORKSPACE, IN ONE PLACE</span>
                      <h2>Plan clearly. Work together. Make progress.</h2>
                      <p>ProjectPilot helps your team organize projects, follow tasks and keep everyone aligned — without losing sight of what matters.</p>
                      <div className="overview-intro-actions">
                        <button className="primary-button" type="button" onClick={() => setActiveView("Projects")}><FolderKanban size={16} /> Explore projects</button>
                        <button className="secondary-button" type="button" onClick={() => { setNewTaskProjectId(projects[0]?.id ?? 1); setIsCreateTaskOpen(true); }}><Plus size={16} /> Create a task</button>
                      </div>
                    </div>
                    <div className="overview-intro-art" aria-hidden="true"><div className="overview-art-orbit orbit-one" /><div className="overview-art-orbit orbit-two" /><div className="overview-art-icon"><FolderKanban size={35} /></div><span className="overview-art-check"><Check size={16} /></span><span className="overview-art-dot" /></div>
                  </section>

                  <section className="overview-metrics" aria-label="Workspace metrics">
                    <article className="overview-metric-card"><span className="overview-metric-icon"><FolderKanban size={18} /></span><span className="overview-metric-label">Total projects</span><strong>{projects.length.toString().padStart(2, "0")}</strong><span className="overview-metric-foot">Across your workspace</span></article>
                    <article className="overview-metric-card"><span className="overview-metric-icon"><ListTodo size={18} /></span><span className="overview-metric-label">Open tasks</span><strong>{openTaskCount.toString().padStart(2, "0")}</strong><span className="overview-metric-foot">Still in progress or to do</span></article>
                    <article className="overview-metric-card"><span className="overview-metric-icon"><CheckSquare size={18} /></span><span className="overview-metric-label">Completed tasks</span><strong>{completedTaskCount.toString().padStart(2, "0")}</strong><span className="overview-metric-foot">Progress worth celebrating</span></article>
                  </section>

                  <div className="overview-lower-grid">
                    <section className="overview-panel">
                      <div className="section-heading"><div><h2>People behind the progress</h2><p>Meet the contributors in your workspace.</p></div><span className="overview-panel-count">{demoUsers.length} members</span></div>
                      <div className="overview-contributors">
                        {demoUsers.map((user, index) => (
                          <article className="overview-contributor" key={user.id}>
                            <Image
                              src={user.avatarUrl}
                              alt=""
                              className="overview-contributor-avatar"
                              width={96}
                              height={96}
                              unoptimized
                            />
                            <div className="overview-contributor-info"><strong>{user.name}</strong><span>{index === 0 ? "Workspace owner" : index === 1 ? "Project contributor" : "Project contributor"}</span></div>
                            <span className="contributor-status-dot" title="Active demo member" />
                          </article>
                        ))}
                      </div>
                      <p className="overview-demo-note">Demo contributors for now — team accounts will be connected to the backend later.</p>
                    </section>

                    <section className="overview-panel overview-focus-panel">
                      <div className="section-heading"><div><h2>What needs attention</h2><p>Your next steps across all projects.</p></div><button className="text-button" type="button" onClick={() => setActiveView("My tasks")}>All tasks <ArrowUpRight size={15} /></button></div>
                      <div className="overview-priority-list">
                        {tasks.filter((task) => task.status !== "COMPLETED").sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 }[a.priority] - { HIGH: 0, MEDIUM: 1, LOW: 2 }[b.priority])).slice(0, 3).map((task) => {
                          const project = projects.find((item) => item.id === task.projectId);
                          return <button className="overview-priority-item" type="button" key={task.id} onClick={() => project && openProject(project)}><span className={`overview-priority-mark priority-mark-${task.priority.toLowerCase()}`} /><span className="overview-priority-copy"><strong>{task.title}</strong><span>{project?.name ?? "Unassigned project"}</span></span><span className={`priority priority-${task.priority.toLowerCase()}`}>{priorityLabels[task.priority]}</span></button>;
                        })}
                        {tasks.every((task) => task.status === "COMPLETED") && <div className="empty-state"><Check size={22} /><strong>All caught up</strong><span>There are no open tasks right now.</span></div>}
                      </div>
                    </section>
                  </div>

                  {isCreateTaskOpen && (
                    <form className="create-task-form" onSubmit={createTask}>
                      <div className="create-task-form-heading"><strong>New task</strong><span>Choose the project this task belongs to.</span></div>
                      <label>Task name<input autoFocus required maxLength={120} placeholder="e.g. Review the interface" value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} /></label>
                      <label>Project<select value={newTaskProjectId} onChange={(event) => setNewTaskProjectId(Number(event.target.value))}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
                      <label>Priority<select value={newTaskPriority} onChange={(event) => setNewTaskPriority(event.target.value as Priority)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
                      <label>Due date<input type="date" value={newTaskDueDate} onChange={(event) => setNewTaskDueDate(event.target.value)} /></label>
                      <div className="create-task-form-actions"><button className="primary-button" type="submit">Create task</button><button className="secondary-button" type="button" onClick={() => setIsCreateTaskOpen(false)}>Cancel</button></div>
                    </form>
                  )}
                </section>
              ) : activeView === "My tasks" ? (
                <section className="section-block task-board-section">
                  <div className="section-heading task-board-heading">
                    <div><h2>Tasks across projects</h2><p>Track every task and move it through its status.</p></div>
                    <div className="task-board-actions">
                      <label className="project-filter-label"><span className="sr-only">Filter tasks by project</span><select value={taskProjectFilter} onChange={(event) => setTaskProjectFilter(event.target.value === "ALL" ? "ALL" : Number(event.target.value))}><option value="ALL">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
                      <button className="primary-button" type="button" onClick={() => { setNewTaskProjectId(taskProjectFilter === "ALL" ? (projects[0]?.id ?? 1) : taskProjectFilter); setIsCreateTaskOpen(true); }}><Plus size={16} /> Add task</button>
                    </div>
                  </div>

                  {isCreateTaskOpen && (
                    <form className="create-task-form" onSubmit={createTask}>
                      <div className="create-task-form-heading"><strong>New task</strong><span>Choose the project this task belongs to.</span></div>
                      <label>Task name<input autoFocus required maxLength={120} placeholder="e.g. Review the interface" value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} /></label>
                      <label>Project<select value={newTaskProjectId} onChange={(event) => setNewTaskProjectId(Number(event.target.value))}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
                      <label>Priority<select value={newTaskPriority} onChange={(event) => setNewTaskPriority(event.target.value as Priority)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
                      <label>Due date<input type="date" value={newTaskDueDate} onChange={(event) => setNewTaskDueDate(event.target.value)} /></label>
                      <div className="create-task-form-actions"><button className="primary-button" type="submit">Create task</button><button className="secondary-button" type="button" onClick={() => setIsCreateTaskOpen(false)}>Cancel</button></div>
                    </form>
                  )}

                  <div className="kanban-board">
                    {(["TODO", "IN_PROGRESS", "COMPLETED"] as TaskStatus[]).map((status) => {
                      const columnTasks = visibleTasks.filter((task) => task.status === status);
                      return <section className="kanban-column" key={status} aria-label={statusLabels[status]}>
                        <header className="kanban-column-header"><span className={`kanban-status-dot kanban-dot-${status.toLowerCase()}`} /><h3>{statusLabels[status]}</h3><span className="kanban-count">{columnTasks.length}</span></header>
                        <div className="kanban-column-content">
                          {columnTasks.map((task) => {
                            const project = projects.find((item) => item.id === task.projectId);
                            const assignee = demoUsers.find((user) => user.id === task.assigneeId);
                            return <article className="kanban-task-card" key={task.id}>
                              <div className="kanban-card-top"><span className={`priority priority-${task.priority.toLowerCase()}`}>{priorityLabels[task.priority]}</span><button className="kanban-project-link" type="button" onClick={() => project && openProject(project)} title="Open project">{project?.name ?? "Unknown project"}</button></div>
                              <h4>{task.title}</h4>
                              <div className="kanban-card-meta">{task.dueDate ? <span><CalendarDays size={13} />{formatDate(task.dueDate)}</span> : <span><CalendarDays size={13} />No due date</span>}{assignee && <span className="kanban-assignee" title={assignee.name}>{assignee.name.split(" ").map((part) => part[0]).join("")}</span>}</div>
                              <label className="kanban-status-control"><span className="sr-only">Change status for {task.title}</span><select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></label>
                            </article>;
                          })}
                          <button className="kanban-add-task" type="button" onClick={() => { setNewTaskProjectId(taskProjectFilter === "ALL" ? (projects[0]?.id ?? 1) : taskProjectFilter); setIsCreateTaskOpen(true); }}><Plus size={15} /> Add task</button>
                        </div>
                      </section>;
                    })}
                  </div>
                </section>
              ) : (
                <section className="section-block">
                  <div className="section-heading">
                    <div>
                      <h2>{{"Calendar":"Upcoming deadlines","Settings":"Workspace settings","Profile":"My profile","Team":"Your contributors","Notifications":"Notifications","Analytics":"Workspace analytics","Attachments":"Project attachments","Search":"Search results"}[activeView] ?? "Your projects"}</h2>
                      <p>{{"Projects":"Manage each project, open its workspace and follow its tasks, members and progress.","Settings":"Personalize your workspace.","Profile":"Your account information and preferences.","Calendar":"Tasks with an upcoming due date, sorted by deadline.","Team":"See the people collaborating across your workspace.","Notifications":"Review important task updates and mark them as read.","Analytics":"A quick snapshot of progress across your demo workspace.","Attachments":"Keep track of files associated with your projects.","Search":"Find projects and tasks in one place."}[activeView] ?? "Review and open your projects."}</p>
                    </div>
                    {activeView === "Overview" && (
                      <button className="text-button" onClick={() => setActiveView("Projects")}>View all projects <ArrowUpRight size={15} /></button>
                    )}
                  </div>

                  {activeView === "Settings" ? (
                    <div className="settings-demo-grid"><article className="feature-card"><Sun size={21}/><strong>Appearance</strong><span>Switch between light and dark mode.</span><button className="secondary-button" onClick={toggleTheme}>Change theme</button></article><article className="feature-card"><Bell size={21}/><strong>Notifications</strong><span>Keep important project updates visible in your workspace.</span><button className="secondary-button" onClick={() => setActiveView("Notifications")}>Manage notifications</button></article></div>
                  ) : activeView === "Profile" ? (
                    <div className="feature-card profile-demo-card"><span className="avatar profile-large-avatar">P</span><strong>ProjectPilot member</strong><span>Demo profile · account details will be connected with authentication.</span></div>
                  ) : activeView === "Calendar" ? (
                    <div className="detail-task-list">{tasks.filter((task) => task.dueDate && task.status !== "COMPLETED").sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")).map((task) => <TaskRow key={task.id} task={task} assignee={demoUsers.find((user) => user.id === task.assigneeId)} onStatusChange={updateTaskStatus} />)}{tasks.every(task => !task.dueDate || task.status === "COMPLETED") && <div className="empty-state"><CalendarDays size={24}/><strong>No upcoming deadlines</strong><span>Add due dates to tasks to see them here.</span></div>}</div>
                  ) : activeView === "Team" ? (
                                <div className="team-grid">{demoUsers.map((user, index) => <article className="team-member-card" key={user.id}>
                                      <Image src={user.avatarUrl} alt="" width={96} height={96} unoptimized className="team-member-avatar" />
                                  <div className="team-member-info">
                                    <strong>{user.name}</strong>
                                    <span>{index === 0 ? "Workspace owner" : "Contributor"}</span>
                                    <span className="team-member-stats">{tasks.filter(task => task.assigneeId === user.id).length} assigned tasks</span></div>
                                  <span className="contributor-status-dot" title="Active demo member" /></article>)}
                                  <button className="add-project-card" onClick={() => window.alert("Team invitations will be connected to the backend in a later step.")}>
                                    <span className="add-project-icon"><Plus size={20} /></span>
                                    <strong>Invite a contributor</strong><span>Collaboration preview</span></button></div>
                  ) : activeView === "Notifications" ? (
                    <div className="notification-list">{tasks.filter(task => task.status !== "COMPLETED" && (task.priority === "HIGH" || task.dueDate)).map((task) => { const project = projects.find(item => item.id === task.projectId); const isRead = readNotifications.includes(task.id); return <article className={`notification-item ${isRead ? "notification-read" : ""}`} key={task.id}><span className="notification-icon"><Bell size={17}/></span><div className="notification-copy"><strong>{task.priority === "HIGH" ? "High-priority task needs attention" : "Task deadline reminder"}</strong><span>{task.title} · {project?.name ?? "Project"}{task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}</span></div><button className="text-button" onClick={() => setReadNotifications(old => isRead ? old.filter(id => id !== task.id) : [...old, task.id])}>{isRead ? "Mark unread" : "Mark read"}</button></article>})}{tasks.filter(task => task.status !== "COMPLETED" && (task.priority === "HIGH" || task.dueDate)).length === 0 && <div className="empty-state"><Check size={24}/><strong>You&apos;re all caught up</strong><span>No task notifications right now.</span></div>}</div>
                  ) : activeView === "Analytics" ? (
                    <div className="analytics-grid"><article className="analytics-card"><span>Completion rate</span><strong>{tasks.length ? Math.round(completedTaskCount / tasks.length * 100) : 0}%</strong><div className="analytics-track"><span style={{width: `${tasks.length ? completedTaskCount / tasks.length * 100 : 0}%`}}/></div><small>{completedTaskCount} of {tasks.length} tasks completed</small></article><article className="analytics-card"><span>Projects in progress</span><strong>{projects.filter(project => project.status === "IN_PROGRESS").length}</strong><small>Projects currently active</small></article><article className="analytics-card"><span>High-priority open tasks</span><strong>{tasks.filter(task => task.priority === "HIGH" && task.status !== "COMPLETED").length}</strong><small>Tasks that may need attention</small></article><article className="analytics-card"><span>Team members</span><strong>{demoUsers.length}</strong><small>Demo contributors in this workspace</small></article></div>
                  ) : activeView === "Attachments" ? (
                    <div className="attachments-panel"><form className="attachment-form" onSubmit={(event) => { event.preventDefault(); const input = (event.currentTarget.elements.namedItem("attachment") as HTMLInputElement); const file = input.files?.[0]; if (!file) return; setAttachments(old => [...old, { id: Date.now(), name: file.name, size: file.size, projectId: attachmentProjectId }]); input.value = ""; }}><label>Project<select value={attachmentProjectId} onChange={event => setAttachmentProjectId(Number(event.target.value))}>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="attachment-file-label"><Paperclip size={18}/><span>Choose a file from your device</span><input type="file" name="attachment" required/></label><button className="primary-button" type="submit"><Plus size={16}/> Add attachment</button><p>Demo only: file names and sizes are shown in this session; files are not uploaded to a server.</p></form><div className="attachment-list">{attachments.map(file => <article className="attachment-item" key={file.id}><span className="attachment-file-icon"><FileText size={19}/></span><div><strong>{file.name}</strong><span>{projects.find(project => project.id === file.projectId)?.name} · {(file.size / 1024).toFixed(1)} KB</span></div><button className="icon-button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments(old => old.filter(item => item.id !== file.id))}><MoreHorizontal size={18}/></button></article>)}{attachments.length === 0 && <div className="empty-state"><Paperclip size={24}/><strong>No attachments yet</strong><span>Choose a file and associate it with a project.</span></div>}</div></div>
                  ) : activeView === "Search" ? (
                    <div className="search-results"><h3>Projects</h3>{visibleProjects.map(project => <button className="search-result-item" key={project.id} onClick={() => openProject(project)}><FolderKanban size={18}/><span><strong>{project.name}</strong><small>{project.description}</small></span><ArrowUpRight size={16}/></button>)}<h3>Tasks</h3>{tasks.filter(task => task.title.toLowerCase().includes(normalizedSearch) || (projects.find(project => project.id === task.projectId)?.name.toLowerCase().includes(normalizedSearch))).map(task => <button className="search-result-item" key={task.id} onClick={() => { setTaskProjectFilter(task.projectId); setActiveView("My tasks"); }}><CheckSquare size={18}/><span><strong>{task.title}</strong><small>{projects.find(project => project.id === task.projectId)?.name} · {statusLabels[task.status]}</small></span><ArrowUpRight size={16}/></button>)}{!normalizedSearch && <p className="search-hint">Enter a project or task name in the search field above, then press Enter.</p>}</div>
                  ) : (
                    <div className="projects-grid projects-grid-minimal">{visibleProjects.map((project) => <ProjectCard key={project.id} project={project} onOpen={openProject} />)}<button className="add-project-card" onClick={() => setIsCreateFormOpen(true)}><span className="add-project-icon"><Plus size={20} /></span><strong>Create a project</strong><span>Start something meaningful.</span></button></div>
                  )}
                </section>
              )}



              <footer className="page-footer">
                <span>Made for meaningful progress.</span>
                <span>ProjectPilot <span className="footer-separator">·</span> Your space to get things done.</span>
              </footer>
            </>
          )}
        </div>
      </section>

      {/* Navigation mobile persistante : la destination Tâches est volontairement mise en avant. */}
      <nav className="bottom-navigation" aria-label="Mobile navigation">
        <button type="button" className={`bottom-nav-item ${activeView === "Overview" && !selectedProject ? "bottom-nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Overview"); }} aria-label="Home"><LayoutDashboard size={20} /><span>Home</span></button>
        <button type="button" className={`bottom-nav-item ${activeView === "Projects" && !selectedProject ? "bottom-nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Projects"); }} aria-label="Projects"><FolderKanban size={20} /><span>Projects</span></button>
        <button type="button" className={`bottom-nav-item bottom-nav-tasks ${activeView === "My tasks" && !selectedProject ? "bottom-nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("My tasks"); }} aria-label="Tasks"><span className="bottom-nav-task-icon"><ListTodo size={23} /></span><span>Tasks</span><span className="bottom-nav-task-count">{openTaskCount}</span></button>
        <button type="button" className={`bottom-nav-item ${activeView === "Calendar" && !selectedProject ? "bottom-nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Calendar"); }} aria-label="Calendar"><CalendarDays size={20} /><span>Calendar</span></button>
        <button type="button" className={`bottom-nav-item ${activeView === "Settings" && !selectedProject ? "bottom-nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Settings"); }} aria-label="Settings"><Settings size={20} /><span>Settings</span></button>
      </nav>
    </main>
  );
}

function ProjectDashboard({
  project,
  tasks,
  onBack,
  onTaskStatusChange,
  onProjectStatusChange,
}: {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onTaskStatusChange: (taskId: number, status: TaskStatus) => void;
  onProjectStatusChange: (projectId: number, status: ProjectStatus) => void;
}) {
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const progress = getProjectProgress(project.id, tasks);

  return (
    <>
      <button className="back-to-projects" type="button" onClick={onBack}>
        <ArrowLeft size={16} /> All projects
      </button>

      <section className="project-detail-hero">
        <Image
          className="project-detail-cover"
          src={project.imageUrl}
          alt=""
          width={1200}
          height={675}
          unoptimized
        />
        <div className="project-detail-heading">
          <div>
            <div className="eyebrow"><span className="status-dot" /> PROJECT WORKSPACE</div>
            <h1>{project.name}</h1>
            <p className="page-subtitle">{project.description}</p>
          </div>
          <label className="project-status-field">
            <span>Project status</span>
            <select value={project.status} onChange={(event) => onProjectStatusChange(project.id, event.target.value as ProjectStatus)}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>
        </div>

        <div className="project-detail-meta">
          <div>
            <span className="detail-meta-label">Contributors</span>
            <AvatarStack members={project.members} />
          </div>
          <div>
            <span className="detail-meta-label">Due date</span>
            <strong><CalendarDays size={15} /> {project.dueDate ? formatDate(project.dueDate) : "Not set"}</strong>
          </div>
          <div>
            <span className="detail-meta-label">Task progress</span>
            <strong>{completedCount} of {tasks.length} completed ({progress}%)</strong>
          </div>
        </div>
        <div className="project-progress-track" role="progressbar" aria-label={`${project.name} task progress`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="section-block project-tasks-section">
        <div className="section-heading">
          <div><h2>Project tasks</h2><p>Each task has one responsible person.</p></div>
          <span className="task-total">{tasks.length} tasks</span>
        </div>

        <div className="task-status-summary">
          {(["TODO", "IN_PROGRESS", "COMPLETED"] as ProjectStatus[]).map((status) => (
            <div className="task-status-summary-item" key={status}>
              <span>{statusLabels[status]}</span>
              <strong>{tasks.filter((task) => task.status === status).length.toString().padStart(2, "0")}</strong>
            </div>
          ))}
        </div>

        <div className="detail-task-list">
          {tasks.length > 0 ? tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              assignee={project.members.find((member) => member.id === task.assigneeId)}
              onStatusChange={onTaskStatusChange}
            />
          )) : (
            <div className="empty-state"><CheckSquare size={24} /><strong>No tasks yet</strong><span>Project tasks will appear here when you add them.</span></div>
          )}
        </div>
      </section>

      <footer className="page-footer">
        <span>Made for meaningful progress.</span>
        <span>ProjectPilot <span className="footer-separator">·</span> Your space to get things done.</span>
      </footer>
    </>
  );
}
