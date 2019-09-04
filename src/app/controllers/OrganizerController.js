import Meetup from '../models/Meetup';

class OrganizerController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      order: ['date'],
      attributes: ['id', 'date', 'title', 'description', 'location'],
    });
    return res.json(meetups);
  }
}

export default new OrganizerController();
