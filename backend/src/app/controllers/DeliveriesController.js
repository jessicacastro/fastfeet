import { Op } from 'sequelize';
import {
  isBefore,
  isAfter,
  parseISO,
  setSeconds,
  setMinutes,
  setHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Signature from '../models/Signature';

class DeliveriesController {
  async index(req, res) {
    const { id } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not exists.' });
    }

    const deliveries = await Package.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
      order: ['created_at'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'cep',
          ],
        },
      ],
    });

    if (deliveries.length === 0) {
      return res.status(400).json({ error: 'No deliveries to show.' });
    }

    return res.json(deliveries);
  }

  async show(req, res) {
    const { id } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not exists.' });
    }

    const deliveriesFinished = await Package.findAll({
      where: {
        deliveryman_id: id,
      },
      end_date: {
        [Op.en]: null,
      },
    });

    return res.json(deliveriesFinished);
  }

  async update(req, res) {
    const { id } = req.params;
    const { package_id } = req.body;

    const start_date = new Date();
    const initHour = start_date
      ? setSeconds(setMinutes(setHours(start_date, 8), 0), 0)
      : null;
    const endHour = start_date
      ? setSeconds(setMinutes(setHours(start_date, 19), 0), 0)
      : null;

    if (!isAfter(start_date, initHour) || !isBefore(start_date, endHour)) {
      return res.status(401).json({
        error: 'You can only pickup packages between 8:00h and 18:00h',
      });
    }

    const packageCreated = await Package.findByPk(package_id, {
      where: {
        deliveryman_id: id,
      },
    });

    if (!packageCreated) {
      return res.status(400).json({ error: 'Package not exists.' });
    }

    const { count } = await Package.findAndCountAll({
      where: {
        deliveryman_id: id,
        start_date: {
          [Op.between]: [startOfDay(start_date), endOfDay(start_date)],
        },
      },
    });

    if (count === 5) {
      return res
        .status(401)
        .json({ error: 'You can only pickup 5 packages per day.' });
    }

    packageCreated.start_date = start_date;

    packageCreated.save();

    return res.json(packageCreated);
  }

  async delete(req, res) {
    const { id } = req.params;
    const { package_id, signature_id } = req.body;

    const packageCreated = await Package.findByPk(package_id, {
      where: {
        delivery_id: id,
        start_date: { [Op.ne]: null },
        canceled_at: null,
        end_date: null,
      },
    });

    if (!packageCreated) {
      return res.status(400).json({ error: 'Package does not exists.' });
    }

    const signature = await Signature.findByPk(signature_id);

    if (!signature) {
      return res
        .status(401)
        .json({ error: 'You can only end a delivery with a signature.' });
    }

    packageCreated.end_date = new Date();
    packageCreated.signature_id = signature.id;

    const packageSaved = await packageCreated.save();

    return res.json(packageSaved);
  }
}

export default new DeliveriesController();
