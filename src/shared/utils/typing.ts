// Utility type to convert union types to intersection types
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PublicData<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
