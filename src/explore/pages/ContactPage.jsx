import React from "react";
import ContactForm from "../../components/ContactForm";

export default function ContactPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "4rem 1.5rem 6rem",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <ContactForm />
      </div>
    </div>
  );
}
