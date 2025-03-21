import KanbanBoard from "./components/KanbanBoard";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Project Tasks</h1>
              <p className="text-sm text-gray-600">Manage and track your tasks progress</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto min-h-0">
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}