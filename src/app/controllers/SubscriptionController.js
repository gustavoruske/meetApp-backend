import { startOfHour, isBefore } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          order: ['date'],
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const { meetupId } = req.params;
    const meetup = await Meetup.findByPk(meetupId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists' });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: 'Cant subscribe to you own meetups' });
    }

    const hourStart = startOfHour(meetup.date);

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const subscriptionExists = await Subscription.findOne({
      where: {
        meetup_id: meetupId,
        user_id: req.userId,
      },
    });

    if (subscriptionExists) {
      return res
        .status(400)
        .json({ error: 'You cant subscribe two times in same meetup' });
    }

    const subscriptionExistsSameDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (subscriptionExistsSameDate) {
      return res
        .status(400)
        .json({ error: 'You cant subscribe in two meetups at same time' });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetupId,
    });

    const subscriber = await User.findByPk(req.userId, {
      attributes: ['name', 'email'],
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      subscriber,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
