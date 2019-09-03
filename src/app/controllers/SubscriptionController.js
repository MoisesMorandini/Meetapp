import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import * as Yup from 'yup';
import User from '../models/User';
import { Op } from 'sequelize';
import { isBefore, isAfter, isEqual, compareDesc, compareAsc } from 'date-fns';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscription = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id', 'user_id', 'meetup_id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['date'],
        },
      ],
      order: [[{ model: Meetup, as: 'meetup' }, 'date']],
    });
    let currentSubs = [];
    subscription.forEach(subs => {
      if (isAfter(subs.meetup.date, new Date())) currentSubs.push(subs);
    });

    return res.json(currentSubs);
  }

  async store(req, res) {
    const schemaYup = Yup.object().shape({
      meetup_id: Yup.number().required(),
    });

    if (!(await schemaYup.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { meetup_id } = req.body;

    /**
     * Find and check if the meetup provided exists
     */
    const meetup = await Meetup.findByPk(meetup_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!meetup) return res.status(400).json({ error: 'Meetup not found' });

    /**
     * Check if is not a passed meetup
     */

    if (isBefore(meetup.date, new Date()))
      return res.status(400).json({
        error: 'Only can subscription on future meetup',
      });

    /*
     * Find and check if the user is not subscription on the meetup
     */
    const moreOneSubs = await Subscription.findOne({
      where: {
        user_id: req.userId,
        meetup_id,
      },
    });

    if (moreOneSubs)
      return res.status(400).json({
        error: 'Not permitted subscription twice on same meetup',
      });

    /**
     * Find all subscription of this User
     */
    const subs = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id', 'meetup_id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'date'],
        },
      ],
    });

    /**
     * Check if the meetup hour is not the same of other meetup
     */
    let sameHour;
    subs.forEach(sub => {
      if (isEqual(sub.meetup.date, meetup.date)) sameHour = true;
    });

    if (sameHour)
      return res.status(400).json({
        error: 'Only can subscription one meetup for hour',
      });

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id,
    });

    /*
     * Create the Subscription
     */ const { name, email: userEmail } = await User.findByPk(
      subscription.user_id
    );

    await Queue.add(SubscriptionMail.key, {
      organizer: meetup.user.name,
      email: meetup.user.email,
      title: meetup.title,
      user: name,
    });
    return res.json(subscription);
  }
}

export default new SubscriptionController();
