export const assistanceTypeOptions = [
  { value: "cash_transfer", labelKey: "assistanceCashTransfer" },
  { value: "cash", labelKey: "assistanceCash" },
  { value: "food", labelKey: "assistanceFood" },
  { value: "rent", labelKey: "assistanceRent" },
  { value: "medical", labelKey: "assistanceMedical" },
  { value: "education", labelKey: "assistanceEducation" },
  { value: "utilities", labelKey: "assistanceUtilities" },
];

export function assistanceTypeLabel(value: string | null | undefined, t: (key: string) => string) {
  if (!value) return "-";
  const match = assistanceTypeOptions.find((option) => option.value === value);
  return match ? t(match.labelKey) : value;
}
