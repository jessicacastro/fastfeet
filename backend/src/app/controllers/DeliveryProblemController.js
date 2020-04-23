import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.params;

    const deliveriesProblems = await DeliveryProblem.findAll({
      order: ['created_at'],
      offset: (page - 1) * 10,
      limit: 10,
    });

    return res.json(deliveriesProblems);
  }

  async show(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;

    const packageCreated = await Package.findByPk(id);

    if (!packageCreated) {
      return res.status(400).json({ error: 'This package not exists.' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Package,
          as: 'package',
          attributes: ['product'],
        },
      ],
    });

    if (!deliveryProblems) {
      return res
        .status(400)
        .json({ error: 'No existing problems for this package.' });
    }

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const packageCreated = await Package.findByPk(id);

    if (!packageCreated) {
      return res.status(400).json({ error: 'Package not exists.' });
    }

    const { description } = req.body;

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id: id,
      description,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const packageCreated = await Package.findByPk(id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'email'],
        },
      ],
    });

    packageCreated.canceled_at = new Date();

    await packageCreated.save();

    await Queue.add(CancellationMail.key, {
      packageCreated,
    });

    return res.json(packageCreated);
  }
}

export default new DeliveryProblemController();
