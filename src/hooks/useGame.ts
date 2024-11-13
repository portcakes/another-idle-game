import { useState, useEffect, useCallback } from 'react';
import { Resource, Building, Task } from '../types/game';

const INITIAL_RESOURCES: Resource[] = [
  { name: 'food', amount: 10, perClick: 1, perSecond: 0, depletionRate: 0.5, lastDepleted: Date.now() },
  { name: 'wood', amount: 10, perClick: 1, perSecond: 0, depletionRate: 0.3, lastDepleted: Date.now() },
  { name: 'stone', amount: 5, perClick: 1, perSecond: 0, depletionRate: 0.2, lastDepleted: Date.now() },
  { name: 'metal', amount: 0, perClick: 1, perSecond: 0, depletionRate: 0.1, lastDepleted: Date.now() },
];

const INITIAL_BUILDINGS: Building[] = [
  {
    name: 'Farm',
    level: 1,
    cost: { food: 15, wood: 10 },
    multiplier: 1.1,
    description: 'Produces food over time',
    produces: { resource: 'food', amount: 2, interval: 3000 },
    lastProduced: Date.now(),
    productionProgress: 0,
  },
  {
    name: 'Barracks',
    level: 1,
    cost: { wood: 20, stone: 15 },
    multiplier: 1.2,
    description: 'Protects resources from raids',
    lastProduced: Date.now(),
    productionProgress: 0,
  },
  {
    name: 'Forge',
    level: 1,
    cost: { metal: 10, stone: 20 },
    multiplier: 1.15,
    description: 'Produces metal over time',
    produces: { resource: 'metal', amount: 1, interval: 5000 },
    lastProduced: Date.now(),
    productionProgress: 0,
  },
];

const TASKS: Task[] = [
  { id: '1', name: 'Harvest Crops', resource: 'food', baseOutput: 1, difficulty: 1, icon: 'Wheat' },
  { id: '2', name: 'Chop Wood', resource: 'wood', baseOutput: 1, difficulty: 1, icon: 'Trees' },
  { id: '3', name: 'Mine Stone', resource: 'stone', baseOutput: 1, difficulty: 2, icon: 'Mountain' },
  { id: '4', name: 'Smelt Metal', resource: 'metal', baseOutput: 1, difficulty: 3, icon: 'Hammer' },
];

export const useGame = () => {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [availableTasks, setAvailableTasks] = useState<Task[]>(TASKS.slice(0, 3));
  const [lastRaid, setLastRaid] = useState(Date.now());

  const getResource = useCallback((name: string) => {
    return resources.find(r => r.name === name)!;
  }, [resources]);

  const updateResource = useCallback((name: string, amount: number) => {
    setResources(prev => 
      prev.map(r => r.name === name ? { ...r, amount: Math.max(0, r.amount + amount) } : r)
    );
  }, []);

  const handleTask = useCallback((task: Task) => {
    const resource = getResource(task.resource);
    const forge = buildings.find(b => b.name === 'Forge')!;
    const multiplier = Math.pow(forge.multiplier, forge.level - 1);
    const output = task.baseOutput * resource.perClick * multiplier;
    updateResource(task.resource, output);
  }, [buildings, getResource, updateResource]);

  const canAffordUpgrade = useCallback((building: Building) => {
    return Object.entries(building.cost).every(([resource, cost]) => {
      const currentAmount = getResource(resource).amount;
      return currentAmount >= cost;
    });
  }, [getResource]);

  const upgradeBuilding = useCallback((buildingName: string) => {
    const building = buildings.find(b => b.name === buildingName)!;
    if (!canAffordUpgrade(building)) return;

    Object.entries(building.cost).forEach(([resource, cost]) => {
      updateResource(resource, -cost);
    });

    setBuildings(prev => 
      prev.map(b => b.name === buildingName ? {
        ...b,
        level: b.level + 1,
        cost: Object.fromEntries(
          Object.entries(b.cost).map(([r, c]) => [r, Math.ceil(c * 1.5)])
        ),
      } : b)
    );
  }, [buildings, canAffordUpgrade, updateResource]);

  // Handle building production
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setBuildings(prev => prev.map(building => {
        if (!building.produces) return building;

        const timeSinceProduction = now - building.lastProduced;
        const cycleProgress = timeSinceProduction / building.produces.interval;

        if (cycleProgress >= 1) {
          const resource = building.produces.resource;
          const amount = building.produces.amount * Math.pow(building.multiplier, building.level - 1);
          updateResource(resource, amount);
          
          return {
            ...building,
            lastProduced: now,
            productionProgress: 0,
          };
        }

        return {
          ...building,
          productionProgress: cycleProgress,
        };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [updateResource]);

  // Handle resource depletion
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setResources(prev => prev.map(resource => {
        const timeSinceDepleted = (now - resource.lastDepleted) / 1000;
        if (timeSinceDepleted >= 15) { // Only deplete every 15 seconds
          const depletionAmount = resource.amount * (resource.depletionRate / 100);
          
          return {
            ...resource,
            amount: Math.max(0, resource.amount - depletionAmount),
            lastDepleted: now,
          };
        }
        return resource;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle task rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setAvailableTasks(prev => {
        const remaining = TASKS.filter(t => !prev.includes(t));
        const newTasks = [...prev.slice(1)];
        if (remaining.length > 0) {
          const randomIndex = Math.floor(Math.random() * remaining.length);
          newTasks.push(remaining[randomIndex]);
        }
        return newTasks;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Handle raids
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRaid > 60000) {
        const barracks = buildings.find(b => b.name === 'Barracks')!;
        const protection = (barracks.level - 1) * 0.1;
        const lossMultiplier = Math.max(0.1, 1 - protection);

        resources.forEach(resource => {
          const loss = resource.amount * 0.2 * lossMultiplier;
          updateResource(resource.name, -loss);
        });

        setLastRaid(now);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [buildings, lastRaid, resources, updateResource]);

  return {
    resources,
    buildings,
    availableTasks,
    handleTask,
    upgradeBuilding,
    canAffordUpgrade,
    lastRaid,
  };
};