import { useState } from "react";
import { toast } from "sonner";
import { enviarContacto } from "../api/contacto";

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      mensaje: mensaje.trim(),
    };

    if (!payload.nombre || !payload.apellido || !payload.email || payload.mensaje.length < 10) {
      toast.error("Completa todos los campos. El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    try {
      setEnviando(true);
      const data = await enviarContacto(payload);

      toast.success(data.message || "Mensaje enviado correctamente.");
      setNombre("");
      setApellido("");
      setEmail("");
      setMensaje("");
    } catch (error) {
      console.error(error);
      const detail =
        error?.response?.data?.email?.[0] ||
        error?.response?.data?.mensaje?.[0] ||
        error?.response?.data?.detail ||
        "Error al enviar mensaje. Intenta de nuevo.";
      toast.error(detail);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ textAlign: "center", marginBottom: 12 }}>Contacto</h1>

        <p
          className="muted"
          style={{
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Estamos disponibles para atender consultas, cotizaciones y solicitudes
          de abastecimiento farmacéutico en Guatemala.
        </p>

        {/* Tarjetas de contacto */}
        <div className="grid3" style={{ marginTop: 32 }}>
          <div className="cardInfo">
            <h3>Atención telefónica</h3>
            <p style={{ lineHeight: 1.6 }}>
              Comunicación directa con nuestro equipo para consultas,
              cotizaciones y coordinación de pedidos.
            </p>
            <p style={{ marginTop: 12, fontWeight: 700 }}>
              📞 +502 0000 0000
            </p>
          </div>

          <div className="cardInfo">
            <h3>Facebook oficial</h3>
            <p style={{ lineHeight: 1.6 }}>
              Información, novedades y atención directa a través de nuestra
              página oficial.
            </p>
            <p style={{ marginTop: 12, fontWeight: 700 }}>
              🔵 facebook.com/Farquetsa
            </p>
          </div>

          <div className="cardInfo">
            <h3>Horarios de atención</h3>
            <p>Lunes a Viernes: 8:00 a.m. – 5:00 p.m.</p>
            <p>Sábados: 8:00 a.m. – 12:00 p.m.</p>
            <p>Domingos: Cerrado</p>
          </div>
        </div>

        {/* Ubicación */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ textAlign: "center", marginBottom: 12 }}>Ubicación</h2>

          <p
            className="muted"
            style={{
              textAlign: "center",
              maxWidth: "700px",
              margin: "0 auto 24px auto",
              lineHeight: 1.6,
            }}
          >
            Atención presencial previa coordinación. Nuestra sede se encuentra
            en Quetzaltenango, Guatemala.
          </p>

          <div className="mapCard">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3490.106725632739!2d-91.5199464!3d14.842451700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x858ea38b78a2b0c5%3A0x444628a06ac3715a!2sFARQUETSA!5e1!3m2!1ses-419!2sgt!4v1770006451115!5m2!1ses-419!2sgt"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación FARQUETSA"
            />
          </div>
        </div>

        {/* Formulario */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ textAlign: "center", marginBottom: 12 }}>
            Formulario de contacto
          </h2>

          <p
            className="muted"
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            Envíanos tu consulta, cotización o solicitud.
          </p>

          <form className="contactForm" onSubmit={handleSubmit}>
            <label className="contactField" htmlFor="contacto-nombre">
              <span>Nombre</span>
              <input
                id="contacto-nombre"
                className="contactInput"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                required
                maxLength={80}
                onChange={(e) => setNombre(e.target.value)}
              />
            </label>

            <label className="contactField" htmlFor="contacto-apellido">
              <span>Apellido</span>
              <input
                id="contacto-apellido"
                className="contactInput"
                type="text"
                placeholder="Tu apellido"
                value={apellido}
                required
                maxLength={80}
                onChange={(e) => setApellido(e.target.value)}
              />
            </label>

            <label className="contactField" htmlFor="contacto-email">
              <span>Correo electrónico</span>
              <input
                id="contacto-email"
                className="contactInput"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                required
                maxLength={254}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="contactField contactFieldFull" htmlFor="contacto-mensaje">
              <span>Mensaje</span>
              <textarea
                id="contacto-mensaje"
                className="contactInput contactTextarea"
                rows={6}
                placeholder="Cuéntanos qué necesitas cotizar o consultar"
                value={mensaje}
                required
                minLength={10}
                maxLength={2000}
                onChange={(e) => setMensaje(e.target.value)}
              />
            </label>

            <div className="contactFormActions">
              <button type="submit" className="btnPrimary" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        </div>

        <p
          className="muted"
          style={{ marginTop: 40, textAlign: "center", lineHeight: 1.6 }}
        >
          Para cotizaciones, abastecimiento o información adicional, puedes
          comunicarte con nuestro equipo a través de los canales indicados.
        </p>
      </div>
    </div>
  );
}
