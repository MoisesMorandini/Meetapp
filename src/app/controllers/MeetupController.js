import * as Yup from 'yup';
import User from '../models/User';
import Meetup from '../models/Meetup';
import { parseISO, isBefore, startOfHour } from 'date-fns';

class MeetupController {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
    });

    return res.json(meetup);
  }

  async store(req, res) {
    const yupSchema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });
    if (!(await yupSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Please check the datas.' });
    }
    const { title, description, localization, date, file_id } = req.body;

    const hour = startOfHour(parseISO(date));

    if (isBefore(hour, new Date())) {
      return res.status(400).json({ error: 'Past dates is not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      localization,
      date,
      user_id: req.userId,
      file_id,
    });
    return res.json(meetup);
    //return res.json({ title, description, localization, date1, file_id });
  }

  async update(req, res) {
    const yupSchema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      localization: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await yupSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not find' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(400).json({ error: 'Only can update your Meetups' });
    }

    //const hour = startOfHour(parseISO(meetup.date));

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'Only can update future dates' });
    }

    if (!isBefore(req.body.date, new Date())) {
      return res.status(400).json({ error: "Can't update with passed dates" });
    }

    const meet = await meetup.update(req.body);

    return res.json(meet);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not find' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(400).json({ error: 'Only delete your meetups' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: "Can't delete past meetups" });
    }

    meetup.destroy();
    return res.json({ message: 'This meetup was deleted' });
  }
}

export default new MeetupController();
