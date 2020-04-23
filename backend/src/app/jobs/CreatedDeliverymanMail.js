import Mail from '../../lib/Mail';

class CreatedDeliverymanMail {
  /**
   * Método acessível por qualquer arquivo que importe essa classe devido ao get.
   * Esse método retorna uma chave única, que teremos para cada job.
   */
  get key() {
    return 'CreatedDeliverymanMail';
  }

  // Tarefa executada quando o processo for executado.
  async handle({ data }) {
    const { id, name, email } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Você foi cadastrado na Fast Feet!',
      template: 'createdDeliveryman',
      context: {
        id,
        name,
        email,
      },
    });
  }
}

export default new CreatedDeliverymanMail();
