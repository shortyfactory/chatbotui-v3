import React from 'react';
import DataSet from './Data';
import './TableComponent.css'; // Import the CSS file

const ChildTable: React.FC<{ data: DataSet[] }> = ({ data }) => {
  return (
    <div className="table-container child">
      <table className="styled-table child">
        <thead>
          <tr>
            <th className="subchildName">Name</th>
            <th>Title</th>
            <th>Occurrences</th>
          </tr>
        </thead>
        <tbody>
          {data.map((child) => (
            <tr key={child.id}>
              <td>{child.name}</td>
              <td className="subchildText">{child.title}</td> {/* Display Title */}
              <td>{child.n_occurrences}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChildTable;
