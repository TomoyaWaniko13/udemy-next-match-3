import { differenceInYears } from 'date-fns';

// 44 (Styling the members cards)
export async function calculateAge(dateOfBirth: Date) {
  return differenceInYears(new Date(), dateOfBirth);
}
