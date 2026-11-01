import { Router } from 'express';

const router = Router();

interface IContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type: 'general' | 'custom_bulk_order' | 'advertising_caps';
  quantity?: number;
  createdAt: string;
}

const contactMessages: IContactMessage[] = [
  {
    id: 'msg-01',
    name: 'College Cultural Fest Coordinator',
    email: 'fest@annauniv.edu',
    phone: '+91 98401 23456',
    subject: 'Bulk 200 units Custom Snapback Caps',
    message: 'Need 200 black snapback caps with 3D embroidery of our fest logo before next month.',
    type: 'custom_bulk_order',
    quantity: 200,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

router.post('/', (req, res) => {
  try {
    const { name, email, phone, subject, message, type = 'general', quantity } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const newMsg: IContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      type,
      quantity: quantity ? Number(quantity) : undefined,
      createdAt: new Date().toISOString()
    };

    contactMessages.unshift(newMsg);

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to DEITY CAPS! Our team in Madurai will get back to you within 24 business hours.',
      inquiryId: newMsg.id
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit contact message.' });
  }
});

router.get('/', (req, res) => {
  return res.json({ success: true, messages: contactMessages });
});

export default router;
