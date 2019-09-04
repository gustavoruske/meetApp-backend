import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  startOfHour,
  parseISO,
  isBefore,
  startOfDay,
  endOfDay,
} from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, location, date, banner_id } = req.body;

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: "You can't update this Meetup" });
    }

    const hourStart = startOfHour(meetup.date);

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'Past dates are not permitted to be updated' });
    }

    const { title } = await meetup.update(req.body);

    return res.json({ title });
  }

  async index(req, res) {
    const { page = 1, date } = req.query;

    const searchDate = parseISO(date);

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
      order: ['date'],
      attributes: ['id', 'date', 'title', 'description', 'location'],
      limit: 10,
      offset: (page - 1) * 10,
    });
    return res.json(meetups);
  }

  async remove(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: "You can't remove this Meetup" });
    }

    const hourStart = startOfHour(meetup.date);

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'Past dates are not permitted to be removed' });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
