// utils/dateFormat.ts
export function formatDateDDMMYY(dateInput: string | Date | null): string {
  if (!dateInput) return "-";
  const date = new Date(dateInput);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice();

  return `${day}-${month}-${year}`;
}
