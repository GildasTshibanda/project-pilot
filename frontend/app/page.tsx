"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckSquare,
  Circle,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  Menu,
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
        <img
          className="contributor-avatar"
          key={member.id}
          src={member.avatarUrl}
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
      <img className="project-cover" src={project.imageUrl} alt="" />
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeView, setActiveView] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

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
    setMobileMenuOpen(false);
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
    if (activeView === "My tasks") return task.status !== "COMPLETED";
    if (selectedProject) return task.projectId === selectedProject.id;
    return true;
  });

  const completedTaskCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const openTaskCount = tasks.length - completedTaskCount;

  return (
    <main className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <a href="#" className="brand" onClick={(event) => { event.preventDefault(); returnToProjectList(); setActiveView("Overview"); }}>
          <span className="brand-mark"><FolderKanban size={20} /></span>
          <span>Project<span className="brand-light">Pilot</span></span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={`nav-item ${activeView === "Overview" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Overview"); setMobileMenuOpen(false); }}>
            <LayoutDashboard size={18} /><span>Overview</span>
          </button>
          <button className={`nav-item ${activeView === "Projects" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Projects"); setMobileMenuOpen(false); }}>
            <FolderKanban size={18} /><span>Projects</span><span className="nav-count">{projects.length}</span>
          </button>
          <button className={`nav-item ${activeView === "My tasks" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("My tasks"); setMobileMenuOpen(false); }}>
            <CheckSquare size={18} /><span>My tasks</span><span className="nav-count">{openTaskCount}</span>
          </button>
          <button className={`nav-item ${activeView === "Calendar" && !selectedProject ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Calendar"); setMobileMenuOpen(false); }}>
            <CalendarDays size={18} /><span>Calendar</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="focus-card">
            <div className="focus-icon"><Clock3 size={17} /></div>
            <p className="focus-title">Stay focused</p>
            <p className="focus-copy">Small steps lead to big results.</p>
            <div className="focus-progress"><span /></div>
            <p className="focus-caption">One thing at a time.</p>
          </div>
          <button className={`nav-item ${activeView === "Settings" ? "nav-active" : ""}`} onClick={() => { returnToProjectList(); setActiveView("Settings"); setMobileMenuOpen(false); }}>
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
          <button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>

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
              />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button theme-button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="avatar top-avatar">P</div>
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

              {activeView === "My tasks" ? (
                <section className="section-block">
                  <div className="section-heading">
                    <div><h2>Your tasks</h2><p>A clear view of what needs your attention.</p></div>
                  </div>
                  <div className="detail-task-list">
                    {visibleTasks.map((task) => (
                      <TaskRow key={task.id} task={task} assignee={demoUsers.find((user) => user.id === task.assigneeId)} onStatusChange={updateTaskStatus} />
                    ))}
                  </div>
                </section>
              ) : (
                <section className="section-block">
                  <div className="section-heading">
                    <div>
                      <h2>{activeView === "Calendar" ? "Coming up" : activeView === "Settings" ? "Workspace settings" : "Your projects"}</h2>
                      <p>{activeView === "Settings" ? "Personalize your workspace." : "Open a project to see its tasks and progress."}</p>
                    </div>
                    {activeView === "Overview" && (
                      <button className="text-button" onClick={() => setActiveView("Projects")}>View all projects <ArrowUpRight size={15} /></button>
                    )}
                  </div>

                  {activeView === "Settings" ? (
                    <div className="empty-state"><Settings size={24} /><strong>Workspace settings</strong><span>Profile and workspace settings will be added in a later step.</span></div>
                  ) : activeView === "Calendar" ? (
                    <div className="detail-task-list">
                      {tasks.filter((task) => task.dueDate && task.status !== "COMPLETED").sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")).map((task) => (
                        <TaskRow key={task.id} task={task} assignee={demoUsers.find((user) => user.id === task.assigneeId)} onStatusChange={updateTaskStatus} />
                      ))}
                    </div>
                  ) : (
                    <div className="projects-grid projects-grid-minimal">
                      {visibleProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} onOpen={openProject} />
                      ))}
                      <button className="add-project-card" onClick={() => setIsCreateFormOpen(true)}>
                        <span className="add-project-icon"><Plus size={20} /></span>
                        <strong>Create a project</strong>
                        <span>Start something meaningful.</span>
                      </button>
                    </div>
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
        <img className="project-detail-cover" src={project.imageUrl} alt="" />
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
