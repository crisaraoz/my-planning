import KanbanBoard from "./components/KanbanBoard";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Tasks</h1>
              <p className="text-gray-600">Manage and track your team's progress</p>
            </div>
          </div>
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}