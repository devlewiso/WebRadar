export interface Website {
  id: number;
  name: string;
  url: string;
  icon: string;
}

export interface Theme {
  name: string;
  background: string;
  isDark: boolean;
  isCustomBackground?: boolean;
}