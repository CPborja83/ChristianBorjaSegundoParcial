document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const country = document.getElementById('country').value;
  const message = document.getElementById('message').value;
  
  if(name && email && country && message) {
    alert('Gracias por contactarnos, ' + name + '! Nos pondremos en contacto contigo pronto.');
    // Aquí podrías agregar código para enviar el formulario a un servidor
  } else {
    alert('Por favor, complete todos los campos.');
  }
});
