import Mail from '../../lib/Mail';

class CancellationMail {
  /**
   * Método acessível por qualquer arquivo que importe essa classe devido ao get.
   * Esse método retorna uma chave única, que teremos para cada job.
   */
  get key() {
    return 'CancellationMail';
  }

  // Tarefa executada quando o processo for executado.
  async handle({ data }) {
    const { packageCreated } = data;
    console.log(packageCreated);

    await Mail.sendMail({
      to: `${packageCreated.deliveryman.name} <${packageCreated.deliveryman.email}>`,
      subject: 'Entrega Agendada',
      template: 'cancellation',
      context: {
        deliveryman: packageCreated.deliveryman.name,
        recipient: packageCreated.recipient.name,
        recipient_email: packageCreated.recipient.email,
        product: packageCreated.product,
      },
    });
  }
}

export default new CancellationMail();
