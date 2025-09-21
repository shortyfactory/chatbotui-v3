interface DataSet {
    id: string;
    type: string;
    name: string;
    parent?: string;
    n_occurrences: number;
    relevance?: string;
    children: DataSet[]; // Optional children property
    title?: string; // New optional title property
}
  


export default DataSet
  
