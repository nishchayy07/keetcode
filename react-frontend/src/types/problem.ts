export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  examples: Example[];
  constraints: string[];
  boilerplates: Record<string, string>;
  solved?: number;
  slug?: string;
}
