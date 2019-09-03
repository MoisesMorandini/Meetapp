import Mail from '../../lib/Mail';
class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { organizer, email, title, user } = data;

    await Mail.sendMail({
      to: `${organizer}<${email}>`,
      subject: 'Novo inscrito no evento',
      template: 'subscription',
      context: {
        organizer,
        title,
        user,
      },
    });
  }
}

export default new SubscriptionMail();
