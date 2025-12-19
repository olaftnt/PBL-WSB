import { prisma } from '@/lib/prisma';
import TicketDetailClient from './TicketDetailClient';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { customer: true, device: true },
  });

  if (!ticket) return notFound();

  return <TicketDetailClient ticket={ticket} />;
}
