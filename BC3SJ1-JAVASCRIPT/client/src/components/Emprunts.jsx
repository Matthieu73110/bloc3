import React, { useEffect, useState } from 'react';
const base = import.meta.env.VITE_BASE_URL || '/';

const Emprunts = () => {
    const [emprunts, setEmprunts] = useState([]);

    useEffect(() => {
        fetch(base+'api/emprunts/history', { credentials: 'include' })
            .then(response => response.json())
            .then(data => setEmprunts(data))
            .catch(error => console.error('Erreur:', error));
    }, []);

    const handleReturn = (id) => {
        fetch(`${base}api/emprunts/return/${id}`, {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => {
            if(response.ok) {
                alert("Livre retourné avec succès.");
                setEmprunts(emprunts.filter(emprunt => emprunt.id_emprunt !== id)); // Remove from current emprunts
            } else {
                alert("Erreur lors du retour.");
            }
        });
    };

    return (
        <div className="container">
            <h1>Mes Emprunts</h1>
            <ul>
                {emprunts.map(emprunt => (
                    <li key={emprunt.id_emprunt}>
                        {emprunt.titre} - Emprunté le {emprunt.date_emprunt} - Retour prévu le {emprunt.date_retour_prevue}
                        {emprunt.date_retour_effective === null ? (
                            <button onClick={() => handleReturn(emprunt.id_emprunt)}>Retourner</button>
                        ) : (
                            <span> - Retourné le {emprunt.date_retour_effective}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Emprunts;
