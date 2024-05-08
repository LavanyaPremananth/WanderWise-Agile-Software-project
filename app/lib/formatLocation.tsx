export function formatLocation({
  city,
  country,
}: {
  city: string | undefined | null;
  country: string;
}) {
  if (!city) return country;
  return `${city}, ${country}`;
}
