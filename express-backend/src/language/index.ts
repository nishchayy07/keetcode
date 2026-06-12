export const LANGUAGE_MAPPING: {
  [key: string]: {
    judge0: number;
    internal: number;
    name: string;
    monaco: string;
  };
} = {
  c: { judge0: 50, internal: 4, name: "C", monaco: "c" },
  cpp: { judge0: 54, internal: 2, name: "C++", monaco: "cpp" },
  java: { judge0: 62, internal: 5, name: "Java", monaco: "java" },
  python: { judge0: 71, internal: 6, name: "Python", monaco: "python" },
  go: { judge0: 60, internal: 7, name: "Go", monaco: "go" },
};
