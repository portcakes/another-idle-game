import React from 'react';
import { ResourceDisplay } from './components/ResourceDisplay';
import { TaskButton } from './components/TaskButton';
import { BuildingCard } from './components/BuildingCard';
import { useGame } from './hooks/useGame';

function App() {
  const { resources, buildings, availableTasks, handleTask, upgradeBuilding, canAffordUpgrade } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Kingdom Builder</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {resources.map(resource => (
            <ResourceDisplay key={resource.name} resource={resource} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Available Tasks</h2>
            <div className="grid gap-4">
              {availableTasks.map(task => (
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
              {buildings.map(building => (
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
    </div>
  );
}

export default App;