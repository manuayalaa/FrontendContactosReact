import React, { Component } from "react";
import styles from "./estilos.css";

class Contactos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactos: [],
      nuevoContacto: {
        nombre: "",
        telefono: "",
        email: "",
      },
      contactoEdit: null,
      jwt: null,
    };
  }

  componentDidMount() {
    this.login();
  }

  login = () => {
    fetch("http://contactos.local/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: "admin",
        password: "admin",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.jwt) {
          console.log("Inicio de sesión exitoso");
          console.log(data.jwt);
          this.setState({ jwt: data.jwt }, () => {
            this.getAllContactos();
          });
        } else {
          console.error("Error de inicio de sesión");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  getAllContactos() {
    if (!this.state.jwt) {
      console.error("Token JWT no disponible");
      return;
    }

    fetch("http://contactos.local/contactos/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.state.jwt}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Solicitud fallida - " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Contactos cargados exitosamente:", data);
        this.setState({ contactos: data });
      })
      .catch((error) => console.error("Error:", error));
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      nuevoContacto: {
        ...prevState.nuevoContacto,
        [name]: value,
      },
    }));
  };

  handleSubmit = (event) => {
    if (!this.state.jwt) {
      console.error("Token JWT no disponible");
      return;
    }

    fetch("http://contactos.local/contactos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.state.jwt}`,
      },
      body: JSON.stringify(this.state.nuevoContacto),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al agregar nuevo contacto");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Contacto agregado exitosamente:", data);
        this.getAllContactos();
        this.setState({
          nuevoContacto: {
            nombre: "",
            telefono: "",
            email: "",
          },
        });
      })
      .catch((error) => console.error("Error:", error));
  };

  handleEdit = (contactoId) => {
    const contactoEdit = this.state.contactos.find((contacto) => contacto.id === contactoId);
  
    if (contactoEdit) {
      this.setState({ contactoEdit });
    } else {
      console.error("No se encontró el contacto con ID:", contactoId);
    }
  };
  
  handleSubmitEdit = (event) => {
    event.preventDefault();
    
    if (!this.state.jwt) {
      console.error("Token JWT no disponible");
      return;
    }
  
    fetch(`http://contactos.local/contactos/${this.state.contactoEdit.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.state.jwt}`,
      },
      body: JSON.stringify(this.state.contactoEdit),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al editar el contacto");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Contacto editado exitosamente:", data);
        this.getAllContactos();
        this.setState({ contactoEdit: null });
      })
      .catch((error) => console.error("Error:", error));
  };
  
  
  handleDelete = (contactoId) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres borrar este contacto?");
    
    if (confirmacion) {
      fetch(`http://contactos.local/contactos/${contactoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.state.jwt}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al borrar el contacto");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Contacto borrado exitosamente:", data);
          this.getAllContactos();
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  handleEditInputChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      contactoEdit: {
        ...prevState.contactoEdit,
        [name]: value,
      },
    }));
  };

  render() {
    const { contactos, nuevoContacto, contactoEdit } = this.state;
    return (
      <div>
        <h2>Agregar Nuevo Contacto</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label>-Nombre: </label>
            <input
              type="text"
              name="nombre"
              value={nuevoContacto.nombre}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label>-Teléfono: </label>
            <input
              type="text"
              name="telefono"
              value={nuevoContacto.telefono}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label>-Email: </label>
            <input
              type="text"
              name="email"
              value={nuevoContacto.email}
              onChange={this.handleInputChange}
            />
          </div>
          <button type="submit">Agregar</button>
        </form>
        <h1>Contactos</h1>
        <ul>
          {contactos.map((contacto) => (
            <li key={contacto.id}>
              <b>-Nombre:</b> {contacto.nombre} <br/>
              -Teléfono: {contacto.telefono} <br/>
              -Email: {contacto.email} <br/>
              -Creado en: {contacto.created_at} <br/>
              -Actualizado en: {contacto.updated_at}<br/>
              <br />
              <button onClick={() => this.handleEdit(contacto.id)}>Editar</button>
              <button onClick={() => this.handleDelete(contacto.id)}>Borrar</button>
              {contactoEdit && contactoEdit.id === contacto.id && (
                <form onSubmit={this.handleSubmitEdit}>
                  <div>
                    <label>Nombre:</label>
                    <input
                      type="text"
                      name="nombre"
                      value={contactoEdit.nombre}
                      onChange={this.handleEditInputChange}
                    />
                  </div>
                  <div>
                    <label>Teléfono:</label>
                    <input
                      type="text"
                      name="telefono"
                      value={contactoEdit.telefono}
                      onChange={this.handleEditInputChange}
                    />
                  </div>
                  <div>
                    <label>Email:</label>
                    <input
                      type="text"
                      name="email"
                      value={contactoEdit.email}
                      onChange={this.handleEditInputChange}
                    />
                  </div>
                  <button type="submit">Guardar cambios</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Contactos;
