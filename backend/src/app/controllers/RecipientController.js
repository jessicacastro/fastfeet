import * as Yup from 'yup';
import User from '../models/User';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const checkIsAdmin = await User.findOne({ where: { id: req.userId } });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'You can only create recipients with admin user.' });
    }

    const {
      name,
      email,
      street,
      number,
      complement,
      state,
      city,
      cep,
    } = req.body;

    const recipient = await Recipient.create({
      name,
      email,
      street,
      number,
      complement,
      state,
      city,
      cep,
    });

    return res.json(recipient);
  }
}

export default new RecipientController();
