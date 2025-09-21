import React from 'react';
import DataSet from './Data';
import ChildTable from './ChildTable';
import './TableComponent.css'; // Import the CSS file

const TableComponent: React.FC<{ data: DataSet[] }> = ({ data }) => {
    return (
        <div className="table-container">
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Goal Name</th>
                        <th>Title</th> {/* New Title Column */}
                        <th>Occurrences</th>
                        <th>Relevance</th>
                        <th>Children</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((goal) => (
                        <tr key={goal.id}>
                            <td>{goal.name}</td>
                            <td>{goal.title}</td> {/* Display Title */}
                            <td>{goal.n_occurrences}</td>
                            <td>{goal.relevance || 'N/A'}</td>
                            <td><ChildTable data={goal.children}></ChildTable></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableComponent;
