import Mail from '../../lib/Mail';

class DeliveryMail {
  /**
   * Método acessível por qualquer arquivo que importe essa classe devido ao get.
   * Esse método retorna uma chave única, que teremos para cada job.
   */
  get key() {
    return 'DeliveryMail';
  }

  // Tarefa executada quando o processo for executado.
  async handle({ data }) {
    const { deliverymanExists: deliveryman, recipientExists: recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Entrega Agendada',
      template: 'package',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        recipient_email: recipient.email,
        address: `${recipient.street}, ${recipient.number}, ${recipient.complement} - ${recipient.state}/${recipient.city} - CEP: ${recipient.cep}`,
      },
    });
  }
}

export default new DeliveryMail();
