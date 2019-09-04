import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, subscriber } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Uma nova inscrição no seu Meetup',
      template: 'subscription',
      context: {
        organizer: meetup.user.name,
        title: meetup.title,
        user: subscriber.name,
        email: subscriber.email,
      },
    });
  }
}

export default new SubscriptionMail();
