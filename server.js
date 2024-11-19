const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Inicialización de la aplicación Express
const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las peticiones como JSON
app.use(bodyParser.json());

// Ruta para servir el archivo HTML de la aplicación cliente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para obtener todas las canciones
app.get('/canciones', (req, res) => {
  fs.readFile('repertorio.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }
    res.json(JSON.parse(data));
  });
});

// Ruta para agregar una nueva canción
app.post('/canciones', (req, res) => {
  const { titulo, artista, tono } = req.body;

  if (!titulo || !artista || !tono) {
    return res.status(400).json({ error: 'Faltan datos para agregar la canción' });
  }

  // Leer el archivo existente
  fs.readFile('repertorio.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }

    const canciones = JSON.parse(data);
    const id = Math.floor(Math.random() * 9999); // Generar un ID único
    const nuevaCancion = { id, titulo, artista, tono };

    canciones.push(nuevaCancion);

    // Guardar el archivo actualizado
    fs.writeFile('repertorio.json', JSON.stringify(canciones, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al guardar la canción' });
      }
      res.status(201).json(nuevaCancion);
    });
  });
});

// Ruta para editar una canción por ID
app.put('/canciones/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, artista, tono } = req.body;

  if (!titulo || !artista || !tono) {
    return res.status(400).json({ error: 'Faltan datos para editar la canción' });
  }

  fs.readFile('repertorio.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }

    let canciones = JSON.parse(data);
    const index = canciones.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    // Actualizar la canción
    canciones[index] = { id: parseInt(id), titulo, artista, tono };

    fs.writeFile('repertorio.json', JSON.stringify(canciones, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al guardar la canción editada' });
      }
      res.json(canciones[index]);
    });
  });
});

// Ruta para eliminar una canción por ID
app.delete('/canciones/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile('repertorio.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }

    let canciones = JSON.parse(data);
    const index = canciones.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    // Eliminar la canción
    const [cancionEliminada] = canciones.splice(index, 1);

    fs.writeFile('repertorio.json', JSON.stringify(canciones, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar la canción' });
      }
      res.json({ message: `Canción "${cancionEliminada.titulo}" eliminada` });
    });
  });
});


app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});