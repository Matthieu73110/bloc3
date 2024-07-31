import React, { useEffect, useState } from 'react';
const base = import.meta.env.VITE_BASE_URL || '/';

const Dashboard = () => {
    const [statistics, setStatistics] = useState({ total_books: 0, total_users: 0 });
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch(base+'api/statistics', { credentials: 'include' })
            .then(response => response.status === 200 ? response.json() : (function(){throw "error"}()))
            .then(data => setStatistics(data))
            .catch(error => console.error('Erreur:', error));

        fetch(base+'api/books', { credentials: 'include' })
            .then(response => response.json())
            .then(data => setBooks(data.filter(book => book.statut === 'disponible')))
            .catch(error => console.error('Erreur:', error));
    }, []);

    const handleBorrow = (id) => {
        fetch(`${base}api/emprunts/borrow/${id}`, {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => {
            if(response.ok) {
                alert("Livre emprunté avec succès.");
                setBooks(books.filter(book => book.id !== id)); // Remove from available books
            } else {
                alert("Erreur lors de l'emprunt.");
            }
        });
    };

    return (
        <div className="container">
            <h1>Dashboard</h1>
            <div className="statistic">
                <h3>Total des Livres</h3>
                <p>{statistics.total_books}</p>
            </div>
            <div className="statistic">
                <h3>Utilisateurs Enregistrés</h3>
                <p>{statistics.total_users}</p>
            </div>
            <div className="available-books">
                <h3>Livres Disponibles</h3>
                <ul>
                    {books.map(book => (
                        <li key={book.id}>
                            {book.titre} - {book.auteur}
                            <button onClick={() => handleBorrow(book.id)}>Emprunter</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Dashboard;
