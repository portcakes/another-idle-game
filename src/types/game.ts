export interface Resource {
  name: string;
  amount: number;
  perClick: number;
  perSecond: number;
  depletionRate: number;
  lastDepleted: number;
}

export interface Building {
  name: string;
  level: number;
  cost: { [key: string]: number };
  multiplier: number;
  description: string;
  produces?: {
    resource: string;
    amount: number;
    interval: number;
  };
  lastProduced: number;
  productionProgress: number;
}

export interface Task {
  id: string;
  name: string;
  resource: string;
  baseOutput: number;
  difficulty: number;
  icon: string;
}