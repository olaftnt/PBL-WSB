'use server';

import { prisma } from '@/lib/prisma';

export type CreateCustomerInput = {
  name: string;
  email?: string | null;
  phone: string; // wymagane
};

export async function createCustomer(input: CreateCustomerInput) {
  const name = input.name?.trim();
  const email = input.email?.trim() || null;
  const phone = input.phone?.trim();

  if (!name) throw new Error('Name is required');
  if (!phone) throw new Error('Phone is required');

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      phone,
    },
  });

  return customer;
}

export type UpdateCustomerInput = {
  id: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
};

export async function updateCustomer(input: UpdateCustomerInput) {
  const { id } = input;
  if (!id) throw new Error('Customer ID is required');

  const name = input.name?.trim();
  const email = input.email?.trim() ?? null;
  const phone = input.phone?.trim() ?? null;

  if (!name) throw new Error('Name is required');
  if (!phone) throw new Error('Phone is required');

  const customer = await prisma.customer.update({
    where: { id },
    data: { name, email, phone },
  });

  return customer;
}