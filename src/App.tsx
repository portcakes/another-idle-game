import { ResourceDisplay } from "./components/ResourceDisplay";
import { TaskButton } from "./components/TaskButton";
import { BuildingCard } from "./components/BuildingCard";
import { useGame } from "./hooks/useGame";
import { Analytics } from "@vercel/analytics/react";
import { RaidTimer } from "./components/RaidTimer";

function App() {
  const {
    resources,
    buildings,
    availableTasks,
    handleTask,
    upgradeBuilding,
    canAffordUpgrade,
    lastRaid,
  } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Another Idle Game
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {resources.map((resource) => (
            <ResourceDisplay key={resource.name} resource={resource} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Available Tasks</h2>
            <div className="grid gap-4">
              {availableTasks.map((task) => (
                <TaskButton
                  key={task.id}
                  task={task}
                  onClick={() => handleTask(task)}
                />
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-black/30 backdrop-blur-sm p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Buildings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buildings.map((building) => (
                <BuildingCard
                  key={building.name}
                  building={building}
                  onUpgrade={() => upgradeBuilding(building.name)}
                  canAfford={canAffordUpgrade(building)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0">
        <RaidTimer lastRaid={lastRaid} />
      </div>
      <footer className="text-center mt-8">
        <p className="text-sm text-gray-400">
          Made with ❤️ by{" "}
          <a href="https://github.com/portcakes" className="text-blue-400">
            Cayla, the portcakess
          </a>
        </p>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
