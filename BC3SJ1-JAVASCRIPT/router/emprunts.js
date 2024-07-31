const express = require('express');
const router = express.Router();
const db = require('./../services/database');

const JWT_SECRET = "HelloThereImObiWan"

function authenticateToken(req, res, next) {
    const token = req.cookies.token
    if (!token) return res.sendStatus(401)

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}


// Route pour emprunter un livre
router.post('/borrow/:id_livre', authenticateToken, (req, res) => {
    const id_livre = req.params.id_livre;
    const id_utilisateur = req.user.id;
    const date_emprunt = new Date();
    const date_retour_prevue = new Date();
    date_retour_prevue.setDate(date_retour_prevue.getDate() + 30); // 30 jours après l'emprunt

    const sqlUpdate = 'UPDATE livres SET statut = "emprunté" WHERE id = ? AND statut = "disponible"';
    const sqlInsert = 'INSERT INTO emprunts (id_utilisateur, id_livre, date_emprunt, date_retour_prevue) VALUES (?, ?, ?, ?)';

    db.query(sqlUpdate, [id_livre], (err, result) => {
        if (err) return res.status(500).send('Erreur lors de la mise à jour du statut du livre.');
        if (result.affectedRows === 0) return res.status(400).send('Livre non disponible.');

        db.query(sqlInsert, [id_utilisateur, id_livre, date_emprunt, date_retour_prevue], (err, result) => {
            if (err) return res.status(500).send('Erreur lors de l\'emprunt du livre.');
            res.send('Livre emprunté avec succès.');
        });
    });
});

// Route pour retourner un livre
router.post('/return/:id_livre', authenticateToken, (req, res) => {
    const id_livre = req.params.id_livre;
    const id_utilisateur = req.user.id;
    const date_retour_effective = new Date();

    const sqlUpdate = 'UPDATE livres SET statut = "disponible" WHERE id = ?';
    const sqlUpdateEmprunt = 'UPDATE emprunts SET date_retour_effective = ? WHERE id_livre = ? AND id_utilisateur = ? AND date_retour_effective IS NULL';

    db.query(sqlUpdateEmprunt, [date_retour_effective, id_livre, id_utilisateur], (err, result) => {
        if (err) return res.status(500).send('Erreur lors de la mise à jour de l\'emprunt.');
        if (result.affectedRows === 0) return res.status(400).send('Aucun emprunt en cours trouvé pour ce livre.');

        db.query(sqlUpdate, [id_livre], (err, result) => {
            if (err) return res.status(500).send('Erreur lors de la mise à jour du statut du livre.');
            res.send('Livre retourné avec succès.');
        });
    });
});

// Route pour obtenir l'historique des emprunts de l'utilisateur
router.get('/history', authenticateToken, (req, res) => {
    const id_utilisateur = req.user.id;
    const sql = `SELECT e.id_emprunt, l.titre, e.date_emprunt, e.date_retour_prevue, e.date_retour_effective 
                 FROM emprunts e 
                 JOIN livres l ON e.id_livre = l.id 
                 WHERE e.id_utilisateur = ?`;

    db.query(sql, [id_utilisateur], (err, results) => {
        if (err) return res.status(500).send('Erreur lors de la récupération de l\'historique des emprunts.');
        res.json(results);
    });
});

module.exports = router;
