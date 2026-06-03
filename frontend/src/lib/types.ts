export type Summary = {
  total_received: string;
  total_distributed: string;
  remaining_balance: string;
  families_assisted_count: number;
  donations_count: number;
  distributions_count: number;
};

export type Donation = {
  id: number;
  donor_name?: string | null;
  donor_display_name?: string | null;
  donor_country?: string | null;
  is_public: boolean;
  amount: string;
  received_date: string;
  notes?: string | null;
};

export type PublicDonation = Pick<Donation, "amount" | "received_date"> & {
  donor_display_name: string;
  donor_country?: string | null;
};

export type Household = {
  id: number;
  household_code: string;
  location?: string | null;
  private_name?: string | null;
  private_phone?: string | null;
  private_notes?: string | null;
  status: "active" | "inactive";
};

export type Distribution = {
  id: number;
  household_id: number;
  household_code: string;
  location?: string | null;
  amount: string;
  distribution_date: string;
  assistance_type?: string | null;
  notes?: string | null;
};

export type PublicDistribution = Omit<Distribution, "id" | "household_id" | "notes">;

export type ImportPreview = {
  valid: boolean;
  rows_valid: number;
  errors: { row: number; errors: string[] }[];
};
