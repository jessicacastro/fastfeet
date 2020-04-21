import * as Yup from 'yup';
import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import DeliveryMail from '../jobs/DeliveryMail';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class PackagesController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const packages = await Package.findAll({
      where: { canceled_at: null },
      order: ['created_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
      ],
    });

    return res.json(packages);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      deliveryman_id: Yup.string().required(),
      recipient_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { product, deliveryman_id, recipient_id } = req.body;

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id, {
      attributes: ['name', 'email'],
    });

    if (!deliverymanExists) {
      return res.status(401).json({
        error: 'You can only create packages with a existing deliveryman.',
      });
    }

    const recipientExists = await Recipient.findByPk(recipient_id, {
      attributes: [
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'cep',
      ],
    });

    if (!recipientExists) {
      return res.status(401).json({
        error: 'You can only create packages with a existing recipient.',
      });
    }

    const packageCreated = await Package.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    await Queue.add(DeliveryMail.key, {
      deliverymanExists,
      recipientExists,
    });

    return res.json(packageCreated);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const packageCreated = await Package.findByPk(id);

    const {
      product,
      recipient_id,
      deliveryman_id,
    } = await packageCreated.update(req.body);

    return res.json({ id, product, recipient_id, deliveryman_id });
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

export default new PackagesController();
