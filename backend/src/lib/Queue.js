import Bee from 'bee-queue';
import DeliveryMail from '../app/jobs/DeliveryMail';
import CancellationMail from '../app/jobs/CancellationMail';
import CreatedDeliverymanMail from '../app/jobs/CreatedDeliverymanMail';

import redisConfig from '../config/redis';

const jobs = [DeliveryMail, CancellationMail, CreatedDeliverymanMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  /**
   * Para cada instância de JOB, nós temos uma fila.
   * Cada fila armazena o bee que é uma instância de conexão com redis para armazenar e recuperar os dados do bd.
   * Cada fila também armazena o handle que processa a fila, recebendo as variáveis de contexto.
   */
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // Adiciona novos jobs dentro da fila para ser processado.
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  /**
   * Percorre cada um dos jobs, recebendo ele mesmo e processa em tempo real.
   */
  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
