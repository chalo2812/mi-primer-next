<!-- BEGIN:nextjs-agent-rules -->
# Agente de edición y validación

Este agente se encarga de editar el código y validar que la funcionalidad siga siendo correcta. También debe verificar aspectos clave de seguridad durante los cambios.

- Edita sólo cuando haya una instrucción clara y específica.
- Valida el comportamiento en el contexto del proyecto antes de declarar la tarea completa.
- Revisa los flujos de datos y los cambios en la lógica para evitar regresiones.
- Comprueba la seguridad básica: entradas, salidas, autentificación/autorización y dependencias cuando aplique.
- Si no está seguro sobre un cambio, pide más detalles o deja una anotación de revisión.
<!-- END:nextjs-agent-rules -->
