const { io } = require("../server");
const { Usuarios } = require("../classes/usuarios");
const { crearMensaje } = require("../utils/utils");

const usuarios = new Usuarios();
// on = escuchar
// emit = emitir

io.on("connection", (client) => {
  client.on("entrarChat", (data, callback) => {
    if (!data.nombre || !data.sala) {
      return callback({
        error: true,
        mensaje: "El nombre/sala es necesario",
      });
    }

    client.join(data.sala);

    let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

    client.broadcast
      .to(data.sala)
      .emit("listaPersona", usuarios.getPersonasPorSala(data.sala));

    callback(usuarios.getPersonasPorSala(data.sala));
  });

  client.on("crearMensaje", (data) => {
    let persona = usuarios.getPersona(client.id);
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);
  });

  client.on("disconnect", () => {
    let personaBorrada = usuarios.borrarPersona(client.id);

    client.broadcast
      .to(persona.sala)
      .emit(
        "crearMensaje",
        crearMensaje(
          "Admnistrador",
          `${personaBorrada.nombre} abandonó el chat`
        )
      );
    client.broadcast
      .to(persona.sala)
      .emit("listaPersona", usuarios.getPersonasPorSala(persona.sala));
  });

  // Mensajes privados
  client.on("mensajePrivado", (data) => {
    let persona = usuarios.getPersona(client.id);
    // para = receptor
    client.broadcast
      .to(data.para)
      .emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
  });
});
